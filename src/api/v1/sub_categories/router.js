const express = require("express");
const {
    createSubRestaurantCategoryController,
    getSubCategoriesController,
    getSubCategoriesByCategoryIDController,
    updateSubCategoryImageController,
} = require("./controller");
const multer = require("../../../middleware/multer");

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

router.put("/:id/image", multer.upload.single("image"), (req, res) => {
    updateSubCategoryImageController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;
