const express = require("express");
const { getRestaurantsController, getRestaurantsByIDController, createRestaurantsController, updateRestaurantsController, deleteRestaurantsController, updateRestaurantImageController } = require("./controller");
const { restaurantSchema } = require("../../validators/restaurantValidator");
const validateRequest = require("../../middleware/validateRequest");
const multer = require("../../middleware/multer");

const router = express.Router();

// Swagger documentation moved to src/config/swagger/restaurant.routes.js

router.get("/", (req, res) => {
  getRestaurantsController(req, (result) => {
    res.json(result);
  });
});

router.get("/:id", (req, res) => {
  getRestaurantsByIDController(req, (result) => {
    res.json(result);
  });
});

router.post("/", multer.upload.array("logo_file"), (req, res) => {
  createRestaurantsController(req, (result) => {
    res.json(result);
  });
});

router.put("/:id", (req, res) => {
  updateRestaurantsController(req, (result) => {
    res.json(result);
  });
});

router.delete("/:id", (req, res) => {
  deleteRestaurantsController(req, (result) => {
    res.json(result);
  });
});

router.put("/:id/image", multer.upload.array("logo_file"), (req, res) => {
  updateRestaurantImageController(req, (result) => {
    res.json(result);
  });
});

module.exports = router;
