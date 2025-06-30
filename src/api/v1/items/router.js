const express = require("express");
const {
    getItemsController,
    getItemByIDController,
    getItemsByCategoryIDController,
    getPaginatedItemsByCategoryIDController,
    createItemController,
    updateItemImageController,
} = require("./controller");
const validateRequest = require("../../../middleware/validateRequest");
const { itemSchema } = require("../../../validators/itemSchema");
const { upload } = require("../../../middleware/multer");
const { authenticateToken } = require("../../../middleware/auth");

const router = express.Router();

// Public routes
router.get("/", (req, res) => {
    getItemsController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Updated route to use category_id instead of sub_cat_id
router.get("/get_by_category_id", (req, res) => {
    getItemsByCategoryIDController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Updated route to use category_id instead of sub_cat_id
router.get("/get_by_category_id_paginated", (req, res) => {
    getPaginatedItemsByCategoryIDController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Protected routes
router.post("/", authenticateToken, upload.single("image"), validateRequest(itemSchema), (req, res) => {
    createItemController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

router.get("/:item_id", (req, res) => {
    getItemByIDController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

router.put("/:id/image", authenticateToken, upload.single("image"), (req, res) => {
    updateItemImageController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

module.exports = router;
