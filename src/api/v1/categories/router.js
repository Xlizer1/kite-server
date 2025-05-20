const express = require("express");
const {
    createRestaurantCategoryController,
    getRestaurantCategoryController,
    updateCategoryImageController,
} = require("./controller");
const multer = require("../../../middleware/multer");

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

router.put("/:id/image", multer.upload.single("image"), (req, res) => {
    updateCategoryImageController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;
