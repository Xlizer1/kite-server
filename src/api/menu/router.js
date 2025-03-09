const express = require("express");
const {
    getRestaurantMainMenuController,
    getCartItemsController,
    addItemToCartController,
    removeItemToCartController,
} = require("./controller");

const router = express.Router();

router.get("/main", (req, res) => {
    getRestaurantMainMenuController(req, (result) => {
        res.json(result);
    });
});

router.get("/cart", (req, res) => {
    getCartItemsController(req, (result) => {
        res.json(result);
    });
});

router.post("/cart/add/:id", (req, res) => {
    addItemToCartController(req, (result) => {
        res.json(result);
    });
});

router.delete("/cart/remove/:id", (req, res) => {
    removeItemToCartController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;
