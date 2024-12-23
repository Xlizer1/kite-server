const express = require("express");
const { createSubRestaurantCategoryController, getSubRestaurantCategoryController } = require("./controller");
const multer = require("../../middleware/multer");

const router = express.Router();

router.get("/", (req, res) => {
  getSubRestaurantCategoryController(req, (result) => {
    res.json(result);
  });
});

router.post("/", multer.upload.single("image"), (req, res) => {
  createSubRestaurantCategoryController(req, (result) => {
    res.json(result);
  });
});

module.exports = router;
