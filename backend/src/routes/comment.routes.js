const express = require("express");
const commentController = require("../controllers/comment.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/comments/:id", authMiddleware.authMiddleware, commentController.createComment);

module.exports = router;
