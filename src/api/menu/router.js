const express = require("express");
const { getRestaurantMainMenuController } = require("./controller");

const router = express.Router();

router.get("/main", (req, res) => {
    getRestaurantMainMenuController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;
