const express = require("express");
const { createSubRestaurantCategoryController } = require("./controller");
const multer = require("../../middleware/multer");

const router = express.Router();

router.post("/", multer.upload.single("image"), (req, res) => {
  createSubRestaurantCategoryController(req, (result) => {
    res.json(result);
  });
});

module.exports = router;
