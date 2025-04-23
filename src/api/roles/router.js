const express = require("express");
const {
    getRolesController,
    createRolesController,
    updateRolesController,
    updateUserPermissionsController,
    deleteRolesController,
} = require("./controller");
const { checkUserAuthorized } = require("../../helpers/common");

const router = express.Router();

router.get("/", checkUserAuthorized(), (req, res) => {
    getRolesController(req, (result) => {
        res.json(result);
    });
});

router.post("/", checkUserAuthorized(), (req, res) => {
    createRolesController(req, (result) => {
        res.json(result);
    });
});

router.put("/:id", checkUserAuthorized(), (req, res) => {
    updateRolesController(req, (result) => {
        res.json(result);
    });
});

router.put("/user/:id", checkUserAuthorized(), (req, res) => {
    updateUserPermissionsController(req, (result) => {
        res.json(result);
    });
});

router.delete("/:id", checkUserAuthorized(), (req, res) => {
    deleteRolesController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;
