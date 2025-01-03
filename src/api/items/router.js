const express = require("express");
const { getItemsController, getItemsBySubCategoryIDController, createItemController } = require("./controller");
const validateRequest = require("../../middleware/validateRequest");
const { itemSchema } = require("../../validators/itemSchema");
const { upload } = require("../../middleware/multer");

const router = express.Router();

router.get("/", (req, res) => {
    getItemsController(req, (result) => {
        res.json(result);
    });
});

router.get("/get_by_sub_cat_id", (req, res) => {
    getItemsBySubCategoryIDController(req, (result) => {
        res.json(result);
    });
});

router.post("/", upload.single("image"), validateRequest(itemSchema), (req, res) => {
    createItemController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;
