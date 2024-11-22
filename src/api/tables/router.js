const express = require("express");
const { registerUserController, loginUserController } = require("./controller");
const { registerUserSchema, loginUserSchema } = require("../../validators/userValidator");
const validateRequest = require("../../middleware/validateRequest");  // Middleware to validate requests

const router = express.Router();

router.post("/register", validateRequest(registerUserSchema), (req, res) => {
  registerUserController(req, (result) => {
    res.json(result);
  });
});

router.post("/login", validateRequest(loginUserSchema), (req, res) => {
  loginUserController(req, (result) => {
    res.json(result);
  });
});

module.exports = router;
