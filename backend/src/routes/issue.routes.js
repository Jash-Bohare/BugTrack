const express = require("express");
const issueController = require("../controllers/issue.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post(
  "/issues",
  authMiddleware.authMiddleware,
  issueController.createIssue,
);

module.exports = router;
