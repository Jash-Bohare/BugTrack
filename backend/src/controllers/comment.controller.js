const issueModel = require("../models/issue.model");
const projectModel = require("../models/project.model");
const commentModel = require("../models/comment.model");
const activityModel = require("../models/activity.model");

async function createComment(req, res) {
  try {
    const issueId = req.params.id;
    const userId = req.user.id;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        message: "Comment content is required",
      });
    }

    const issue = await issueModel.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const project = await projectModel.findById(issue.projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.toString() === userId,
    );

    if (!isMember) {
      return res.status(403).json({
        message: "Access denied. You are not a member of this project",
      });
    }

    const comment = await commentModel.create({
      issueId,
      userId,
      content: content.trim(),
    });

    await activityModel.create({
      issueId,
      userId,
      action: "COMMENTED",
      meta: {
        commentId: comment._id,
      },
    });

    return res.status(201).json({
      message: "Comment added successfully",
      comment,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function getComments(req, res) {
  try {
    const issueId = req.params.id;
    const userId = req.user.id;

    const issue = await issueModel.findById(issueId);
    if (!issue) {
      return res.status(404).json({
        message: "Issue not found",
      });
    }

    const project = await projectModel.findById(issue.projectId);
    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    const isMember = project.members.some(
      (member) => member.toString() === userId,
    );

    if (!isMember) {
      return res.status(403).json({
        message: "Access denied. You are not a member of this project",
      });
    }

    const comments = await commentModel
      .find({ issueId })
      .sort({ createdAt: -1 });

    const formattedComments = comments.map((comment) => {
      if (comment.isDeleted) {
        return {
          _id: comment._id,
          issueId: comment.issueId,
          userId: comment.userId,
          content: "This comment was deleted",
          isDeleted: true,
          createdAt: comment.createdAt,
          updatedAt: comment.updatedAt,
        };
      }
      return comment;
    });

    return res.status(200).json({
      message: "Comments fetched successfully",
      count: formattedComments.length,
      comments: formattedComments,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function deleteComment(req, res) {
  try {
    const commentId = req.params.commentId;
    const userId = req.user.id;

    const comment = await commentModel.findById(commentId);

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.userId.toString() !== userId) {
      return res.status(403).json({
        message: "Access denied. You are not the author of this comment",
      });
    }

    if (comment.isDeleted) {
      return res.status(400).json({
        message: "Comment already deleted",
      });
    }

    comment.isDeleted = true;
    await comment.save();

    await activityModel.create({
      issueId: comment.issueId,
      userId,
      action: "DELETED",
      meta: {
        commentId: comment._id,
        type: "comment",
      },
    });

    return res.status(200).json({
      message: "Comment deleted successfully",
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function getNotifications(req, res) {
  try {
    const userId = req.user.id;

    const projects = await projectModel
      .find({
        members: userId,
      })
      .select("_id");

    const projectIds = projects.map((p) => p._id);

    const issues = await issueModel
      .find({
        projectId: { $in: projectIds },
      })
      .select("_id");

    const issueIds = issues.map((i) => i._id);

    const activities = await activityModel
      .find({
        issueId: { $in: issueIds },
      })
      .sort({ createdAt: -1 })
      .limit(20);

    return res.status(200).json({
      message: "Notifications fetched successfully",
      count: activities.length,
      notifications: activities,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

module.exports = {
  createComment,
  getComments,
  deleteComment,
  getNotifications,
};
