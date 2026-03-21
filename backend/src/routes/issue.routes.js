const express = require("express");
const issueController = require("../controllers/issue.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/issues", authMiddleware.authMiddleware, issueController.createIssue);
router.get("/issues", authMiddleware.authMiddleware, issueController.getIssues);
router.get("/issues/:id", authMiddleware.authMiddleware, issueController.getIssueById);

module.exports = router;
