const express = require("express");
const {
    getTablesController,
    getTablesByIDController,
    createTablesController,
    updateTablesController,
    deleteTablesController,
} = require("./controller");
const { tableSchema } = require("../../../validators/tablesValidator");
const validateRequest = require("../../../middleware/validateRequest");

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

router.post("/", validateRequest(tableSchema), (req, res) => {
    createTablesController(req, (result) => {
        res.json(result);
    });
});

router.put("/:id", validateRequest(tableSchema), (req, res) => {
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
