const express = require("express");
const {
    getRestaurantsController,
    getRestaurantsByIDController,
    createRestaurantsController,
    updateRestaurantsController,
    deleteRestaurantsController,
    updateRestaurantImageController,
} = require("./controller");
const { restaurantSchema } = require("../../../validators/restaurantValidator");
const validateRequest = require("../../../middleware/validateRequest");
const multer = require("../../../middleware/multer");
const { checkUserAuthorized } = require("../../../helpers/common");

const router = express.Router();

// Swagger documentation moved to src/config/swagger/restaurant.routes.js

router.get("/", checkUserAuthorized(), (req, res) => {
    getRestaurantsController(req, (result) => {
        res.json(result);
    });
});

router.get("/:id", checkUserAuthorized(), (req, res) => {
    getRestaurantsByIDController(req, (result) => {
        res.json(result);
    });
});

router.post("/", checkUserAuthorized(), multer.upload.array("logo_file"), (req, res) => {
    createRestaurantsController(req, (result) => {
        res.json(result);
    });
});

router.put("/:id", checkUserAuthorized(), (req, res) => {
    updateRestaurantsController(req, (result) => {
        res.json(result);
    });
});

router.delete("/:id", checkUserAuthorized(), (req, res) => {
    deleteRestaurantsController(req, (result) => {
        res.json(result);
    });
});

router.put("/:id/image", checkUserAuthorized(), multer.upload.single("image"), (req, res) => {
    updateRestaurantImageController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;
