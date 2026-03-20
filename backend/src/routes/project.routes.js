const express = require("express");
const projectController = require("../controllers/project.controller")
const validationRules = require("../middlewares/validation.middleware")
const authMiddleware = require("../middlewares/auth.middleware")

const router = express.Router();

router.post("/projects", authMiddleware.authMiddleware, validationRules.projectValidationRules, projectController.createProject);
router.get("/projects", authMiddleware.authMiddleware, projectController.getAllProjects);
router.get("/projects/:id", authMiddleware.authMiddleware, projectController.getProjectById);

module.exports = router;
