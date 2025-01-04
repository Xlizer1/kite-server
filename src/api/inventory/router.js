const express = require("express");
const router = express.Router();
const { getInventoryItemsController, getInventoryItemsByRestaurantIDController, createInventoryItemController } = require("./controller");

router.get("/", (req, res) => {
    getInventoryItemsController(req, (result) => {
        res.send(result);
    });
});

router.get("/:restaurant_id", (req, res) => {
    getInventoryItemsByRestaurantIDController(req, (result) => {
        res.send(result);
    });
});

router.post("/", (req, res) => {
    createInventoryItemController(req, (result) => {
        res.send(result);
    });
});

module.exports = router;
