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
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be betn 3 and 20 chars"),

  body("email").isEmail().withMessage("Invalid Email address"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  validateResult,
];

module.exports = { registerUserValidationRules };
