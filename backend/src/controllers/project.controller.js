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

async function userProjects(req, res) {
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

module.exports = { createProject, userProjects };
