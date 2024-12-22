const express = require("express");
const { createRestaurantCategoryController } = require("./controller");
const multer = require("../../middleware/multer");

const router = express.Router();

router.post("/", multer.upload.single("image"), (req, res) => {
  createRestaurantCategoryController(req, (result) => {
    res.json(result);
  });
});

module.exports = router;
