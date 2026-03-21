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

module.exports = { createIssue, getIssues };
