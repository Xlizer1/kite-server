const express = require("express");
const {
    getRestaurantCategoryController,
    createRestaurantCategoryController,
    updateCategoryController,
    updateCategoryImageController,
} = require("./controller");
const multer = require("../../../middleware/multer");
const { requirePermission } = require("../../../helpers/permissions");
const validateRequest = require("../../../middleware/validateRequest");
const {
    categoryCreateSchema,
    categoryUpdateSchema,
    categoryImageUpdateSchema,
} = require("../../../validators/categorySchema");
const { checkUserAuthorized } = require("../../../helpers/common");

const router = express.Router();

router.get("/", checkUserAuthorized(), requirePermission("categories", "read"), (req, res) => {
    getRestaurantCategoryController(req, (result) => {
        res.json(result);
    });
});

router.post(
    "/",
    checkUserAuthorized(),
    requirePermission("categories", "create"),
    multer.upload.single("image"),
    validateRequest(categoryCreateSchema),
    (req, res) => {
        createRestaurantCategoryController(req, (result) => {
            res.json(result);
        });
    }
);

router.put(
    "/:id",
    checkUserAuthorized(),
    requirePermission("categories", "update"),
    validateRequest(categoryUpdateSchema),
    (req, res) => {
        updateCategoryController(req, (result) => {
            res.json(result);
        });
    }
);

router.put(
    "/:id/image",
    checkUserAuthorized(),
    requirePermission("categories", "update"),
    multer.upload.single("image"),
    validateRequest(categoryImageUpdateSchema),
    (req, res) => {
        updateCategoryImageController(req, (result) => {
            res.json(result);
        });
    }
);

module.exports = router;
