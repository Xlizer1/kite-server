const express = require("express");
const { getTablesController, getTablesByIDController, createTablesController, updateTablesController, deleteTablesController } = require("./controller");

const router = express.Router();

router.get("/", (req, res) => {
  getTablesController(req, (result) => {
    res.json(result);
  });
});

router.get("/:id", (req, res) => {
  getTablesByIDController(req, (result) => {
    res.json(result);
  });
});

router.post("/", (req, res) => {
  createTablesController(req, (result) => {
    res.json(result);
  });
});

router.put("/:id", (req, res) => {
  updateTablesController(req, (result) => {
    res.json(result);
  });
});

router.delete("/:id", (req, res) => {
  deleteTablesController(req, (result) => {
    res.json(result);
  });
});

module.exports = router;
