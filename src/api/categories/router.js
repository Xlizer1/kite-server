const express = require("express");
const { createRestaurantCategoryController, getRestaurantCategoryController } = require("./controller");
const multer = require("../../middleware/multer");

const router = express.Router();

router.get("/", multer.upload.single("image"), (req, res) => {
  getRestaurantCategoryController(req, (result) => {
    res.json(result);
  });
});

router.post("/", multer.upload.single("image"), (req, res) => {
  createRestaurantCategoryController(req, (result) => {
    res.json(result);
  });
});

module.exports = router;
