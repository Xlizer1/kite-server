const express = require("express");
const { registerUserController, loginUserController, updateUserController, getUserByIdController, getUsersController, deleteUserModel } = require("./controller");
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

router.put("/:id", validateRequest(registerUserSchema), (req, res) => {
  updateUserController(req, (result) => {
    res.json(result);
  });
});

router.delete("/:id", (req, res) => {
  deleteUserModel(req, (result) => {
    res.json(result);
  });
});

router.post("/register", validateRequest(registerUserSchema), (req, res) => {
  registerUserController(req, (result) => {
    res.json(result);
  });
});

router.post("/", validateRequest(loginUserSchema), (req, res) => {
  loginUserController(req, (result) => {
    res.json(result);
  });
});

module.exports = router;
