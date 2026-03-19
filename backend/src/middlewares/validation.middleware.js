const { body, validationResult } = require("express-validator");

async function validateResult(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  next();
}
const registerUserValidationRules = [
  body("name")
    .notEmpty()
    .withMessage("Name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be betn 3 and 20 chars"),

  body("email").isEmail().withMessage("Invalid Email address"),

  body("password")
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  validateResult,
];

const projectValidationRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required")
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 50 })
    .withMessage("Project name must be between 3 and 50 characters"),

  body("description")
    .optional()
    .trim()
    .isString()
    .withMessage("Description must be a string")
    .isLength({ max: 300 })
    .withMessage("Description cannot exceed 300 characters")
    .custom((value) => {
      if (value && value.trim().length === 0) {
        return false;
      }
      return true;
    })
    .withMessage("Description cannot be empty spaces"),

  validateResult,
];

module.exports = { registerUserValidationRules, projectValidationRules };
