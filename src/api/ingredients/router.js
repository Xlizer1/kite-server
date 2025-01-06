const express = require("express");
const router = express.Router();
const { getIngredientsController, getIngredientsByRestaurantIDController, createIngredientController } = require("./controller");

router.get("/", (req, res) => {
    getIngredientsController(req, (result) => {
        res.send(result);
    });
});

router.get("/:restaurant_id", (req, res) => {
    getIngredientsByRestaurantIDController(req, (result) => {
        res.send(result);
    });
});

router.post("/", (req, res) => {
    createIngredientController(req, (result) => {
        res.send(result);
    });
});

module.exports = router;
