const express = require("express");
const { createSubRestaurantCategoryController, getSubCategoriesController, getSubCategoriesByCategoryIDController } = require("./controller");
const multer = require("../../middleware/multer");

const router = express.Router();

router.get("/", (req, res) => {
  getSubCategoriesController(req, (result) => {
    res.json(result);
  });
});

router.get("/get_by_category_id", (req, res) => {
  getSubCategoriesByCategoryIDController(req, (result) => {
    res.json(result);
  });
});

router.post("/", multer.upload.single("image"), (req, res) => {
  createSubRestaurantCategoryController(req, (result) => {
    res.json(result);
  });
});

module.exports = router;
