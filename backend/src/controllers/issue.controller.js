const issueModel = require("../models/issue.model");
const projectModel = require("../models/project.model");
const activityModel = require("../models/activity.model");

async function createIssue(req, res) {
  try {
    const { projectId, title, description, priority } = req.body;
    const userId = req.user.id;

    const project = await projectModel.findById(projectId);

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

    const issue = await issueModel.create({
      title,
      description,
      priority,
      projectId,
      reporterId: userId,
    });

    await activityModel.create({
      issueId: issue._id,
      userId: userId,
      action: "CREATED",
      meta: {},
    });

    res.status(201).json({
      message: "Issue created successfully",
      issue: issue,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function getIssues(req, res) {
  try {
    const userId = req.user.id;

    const {
      projectId,
      status,
      priority,
      assignee,
      page = 1,
      limit = 10,
    } = req.query;

    if (projectId) {
      const project = await projectModel.findById(projectId);

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
          message: "Access denied",
        });
      }
    }

    let filter = {};

    if (projectId) filter.projectId = projectId;
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assigneeId = assignee;

    const skip = (page - 1) * limit;

    const issues = await issueModel
      .find(filter)
      .skip(skip)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Issues fetched successfully",
      count: issues.length,
      issues,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function getIssueById(req, res) {
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

    const activities = await activityModel
      .find({ issueId: issueId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Issue fetched successfully",
      issue,
      activities,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function updateIssue(req, res) {
  try {
    const { title, description, priority, assigneeId } = req.body;
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

    let activities = [];

    if (title && title !== issue.title) {
      activities.push({
        issueId,
        userId,
        action: "UPDATED",
        meta: {
          field: "title",
          old: issue.title,
          new: title,
        },
      });

      issue.title = title;
    }

    if (description && description !== issue.description) {
      activities.push({
        issueId,
        userId,
        action: "UPDATED",
        meta: {
          field: "description",
          old: issue.description,
          new: description,
        },
      });

      issue.description = description;
    }

    if (priority && priority !== issue.priority) {
      activities.push({
        issueId,
        userId,
        action: "UPDATED",
        meta: {
          field: "priority",
          old: issue.priority,
          new: priority,
        },
      });

      issue.priority = priority;
    }

    if (assigneeId && assigneeId !== issue.assigneeId?.toString()) {
      const isValidAssignee = project.members.some(
        (member) => member.toString() === assigneeId,
      );

      if (!isValidAssignee) {
        return res.status(400).json({
          message: "Assignee must be a project member",
        });
      }

      activities.push({
        issueId,
        userId,
        action: "ASSIGNED",
        meta: {
          old: issue.assigneeId,
          new: assigneeId,
        },
      });

      issue.assigneeId = assigneeId;
    }

    await issue.save();

    if (activities.length > 0) {
      await activityModel.insertMany(activities);
    }

    return res.status(200).json({
      message: "Issue updated successfully",
      issue,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

module.exports = { createIssue, getIssues, getIssueById, updateIssue };
