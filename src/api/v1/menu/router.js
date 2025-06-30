const express = require("express");
const { getRestaurantMainMenuController, getCategoriesController } = require("./controller");

const router = express.Router();

router.get("/main", (req, res) => {
    getRestaurantMainMenuController(req, (result) => {
        res.json(result);
    });
});

router.get("/categories", (req, res) => {
    getCategoriesController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;
