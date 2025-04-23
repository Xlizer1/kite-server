const express = require("express");
const { getRestaurantTablesController } = require("./controller");
const { checkUserAuthorized } = require("../../helpers/common");

const router = express.Router();

router.get("/tables", checkUserAuthorized(), (req, res) => {
    getRestaurantTablesController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;
