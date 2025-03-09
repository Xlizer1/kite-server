const express = require("express");
const {
    registerUserController,
    loginUserController,
    updateUserController,
    getUserByIdController,
    getUsersController,
    deleteUserModel,
} = require("./controller");
const { registerUserSchema, loginUserSchema } = require("../../validators/userValidator");
const validateRequest = require("../../middleware/validateRequest");

const router = express.Router();

router.get("/listAll", (req, res) => {
    getUserByIdController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;
