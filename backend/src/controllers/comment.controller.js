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

module.exports = { createComment, getComments };
