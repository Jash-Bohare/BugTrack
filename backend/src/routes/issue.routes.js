const express = require("express");
const issueController = require("../controllers/issue.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/issues", authMiddleware.authMiddleware, issueController.createIssue);
router.get("/issues", authMiddleware.authMiddleware, issueController.getIssues);
router.get("/issues/:id", authMiddleware.authMiddleware, issueController.getIssueById);
router.patch("/issues/:id", authMiddleware.authMiddleware, issueController.updateIssue);
router.patch("/issues/:id/status", authMiddleware.authMiddleware, issueController.changeStatus);

module.exports = router;
