const express = require("express");
const authController = require("../controllers/auth.controller");
const validationRules = require("../middlewares/validation.middleware")
const authMiddleware = require("../middlewares/auth.middleware")

const router = express.Router();

router.post("/register", validationRules.registerUserValidationRules, authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/verify-otp", authController.verifyOtp)
router.get("/me", authMiddleware.authMiddleware, authController.getCurrentUser);
router.patch("/me", authMiddleware.authMiddleware, authController.updateUser);

module.exports = router;
