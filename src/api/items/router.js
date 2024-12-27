const express = require("express");
const { createItemController } = require("./controller");
const validateRequest = require("../../middleware/validateRequest");
const { itemSchema } = require("../../validators/itemSchema");
const { upload } = require("../../middleware/multer");

const router = express.Router();

router.post("/", upload.single("image"), validateRequest(itemSchema), (req, res) => {
    createItemController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;
