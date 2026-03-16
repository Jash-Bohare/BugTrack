const express = require("express");
const authController = require("../controllers/auth.controller");
const validationRules = require("../middlewares/validation.middleware")

const router = express.Router();

router.post("/register", validationRules.registerUserValidationRules, authController.registerUser);
router.post("/login", authController.loginUser);

module.exports = router;
