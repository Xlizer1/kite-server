const express = require("express");
const { registerUserController, loginUserController, getUserByIdController, getUsersController } = require("./controller");
const { registerUserSchema, loginUserSchema } = require("../../validators/userValidator");
const validateRequest = require("../../middleware/validateRequest");

const router = express.Router();

router.get("/", (req, res) => {
  getUsersController(req, (result) => {
    res.json(result);
  });
});

router.get("/:id", (req, res) => {
  getUserByIdController(req, (result) => {
    res.json(result);
  });
});

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
