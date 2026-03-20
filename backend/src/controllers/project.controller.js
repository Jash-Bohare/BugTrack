const projectModel = require("../models/project.model");
const userModel = require("../models/user.model");

async function createProject(req, res) {
  try {
    if (!req.user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email before creating a project",
      });
    }

    const { name, description } = req.body;

    const project = await projectModel.create({
      name,
      description,
      ownerId: req.user.id,
      members: [req.user.id],
    });

    res.status(201).json({
      message: "Project created successfully",
      project: project,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function getAllProjects(req, res) {
  try {
    const userId = req.user.id;

    const projects = await projectModel.find({
      members: userId,
    });

    return res.status(200).json({
      message: "Projects fetched successfully",
      projects,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function getProjectById(req, res) {
  try {
    const projectId = req.params.id;
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

    return res.status(200).json({
      message: "Project fetched successfully",
      project,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

async function addMembers(req, res) {
  try {
    const projectId = req.params.id;
    const userId = req.user.id;
    const { email } = req.body;

    const project = await projectModel.findById(projectId);

    if (!project) {
      return res.status(404).json({
        message: "Project not found",
      });
    }

    if (project.ownerId.toString() !== userId) {
      return res.status(403).json({
        message: "Access denied. You are not owner of the project",
      });
    }

    const userToAdd = await userModel.findOne({ email });

    if (!userToAdd) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isAlreadyMember = project.members.some(
      (member) => member.toString() === userToAdd._id.toString(),
    );

    if (isAlreadyMember) {
      return res.status(400).json({
        message: "User is already a member of this project",
      });
    }

    project.members.push(userToAdd._id);

    await project.save();

    return res.status(200).json({
      message: "Member added successfully",
      project,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Something went wrong",
    });
  }
}

module.exports = { createProject, getAllProjects, getProjectById, addMembers };
