const express = require("express");
const { getRolesController, createRolesController, updateRolesController, updateUserPermissionsController, deleteRolesController } = require("./controller");

const router = express.Router();

router.get("/", (req, res) => {
  getRolesController(req, (result) => {
    res.json(result);
  });
});

router.post("/", (req, res) => {
  createRolesController(req, (result) => {
    res.json(result);
  });
});

router.put("/:id", (req, res) => {
  updateRolesController(req, (result) => {
    res.json(result);
  });
});

router.put("/user/:id", (req, res) => {
  updateUserPermissionsController(req, (result) => {
    res.json(result);
  });
});

router.delete("/:id", (req, res) => {
  deleteRolesController(req, (result) => {
    res.json(result);
  });
});

module.exports = router;
