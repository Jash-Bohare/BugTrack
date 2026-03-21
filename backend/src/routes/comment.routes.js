const express = require("express");
const commentController = require("../controllers/comment.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/comments/:id", authMiddleware.authMiddleware, commentController.createComment);
router.get("/issues/:id/comments", authMiddleware.authMiddleware, commentController.getComments);
router.delete("/comments/:commentId", authMiddleware.authMiddleware, commentController.deleteComment);
router.get("/notifications", authMiddleware.authMiddleware, commentController.getNotifications);

module.exports = router;
