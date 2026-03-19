const projectModel = require("../models/project.model");
const userModel = require("../models/user.model");

async function createProject(req, res) {
  try {
    const user = await userModel.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    if (!user.isVerified) {
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

module.exports = { createProject };
