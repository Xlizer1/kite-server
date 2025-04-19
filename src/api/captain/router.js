const express = require("express");
const { getRestaurantTablesController } = require("./controller");

const router = express.Router();

router.get("/tables", (req, res) => {
    getRestaurantTablesController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;
