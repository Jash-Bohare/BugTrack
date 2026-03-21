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

module.exports = { createIssue };
