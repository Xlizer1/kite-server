const express = require("express");
const { getItemsController, getItemsBySubCategoryIDController, getPaginatedItemsBySubCategoryIDController, createItemController, updateItemImageController } = require("./controller");
const validateRequest = require("../../middleware/validateRequest");
const { itemSchema } = require("../../validators/itemSchema");
const { upload } = require("../../middleware/multer");
const { authenticateToken } = require("../../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", (req, res) => {
    getItemsController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

router.get("/get_by_sub_cat_id", (req, res) => {
    getItemsBySubCategoryIDController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

router.get("/get_by_sub_cat_id_paginated", (req, res) => {
    getPaginatedItemsBySubCategoryIDController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Protected routes
router.post(
    "/", 
    authenticateToken,
    upload.single("image"), 
    validateRequest(itemSchema), 
    (req, res) => {
        createItemController(req, (result) => {
            res.status(result.statusCode || 200).json(result);
        });
    }
);

router.put("/:id/image", authenticateToken, upload.single("image"), (req, res) => {
    updateItemImageController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

module.exports = router;
