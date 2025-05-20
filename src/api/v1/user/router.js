const express = require("express");
const {
    registerUserController,
    loginUserController,
    updateUserController,
    getUserByIdController,
    getUsersController,
    deleteUserModel,
} = require("./controller");
const { checkUserAuthorized } = require("../../../helpers/common");

const router = express.Router();

router.post("/register", checkUserAuthorized(), (req, res) => {
    registerUserController(req, (result) => {
        res.json(result);
    });
});

router.post("/", (req, res) => {
    loginUserController(req, (result) => {
        res.json(result);
    });
});

router.get("/", checkUserAuthorized(), (req, res) => {
    getUsersController(req, (result) => {
        res.json(result);
    });
});

router.get("/:id", checkUserAuthorized(), (req, res) => {
    getUserByIdController(req, (result) => {
        res.json(result);
    });
});

router.put("/:id", checkUserAuthorized(), (req, res) => {
    updateUserController(req, (result) => {
        res.json(result);
    });
});

router.delete("/:id", checkUserAuthorized(), (req, res) => {
    deleteUserModel(req, (result) => {
        res.json(result);
    });
});

module.exports = router;
