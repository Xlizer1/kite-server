const express = require("express");
const router = express.Router();
const {
    getInventoryBatchesController,
    getInventoryBatchesByInventoryIdController,
    createInventoryBatchController,
    updateInventoryBatchController,
    consumeFromBatchesController,
    getBatchMovementsController,
    getExpiringBatchesController,
    getBatchAnalyticsController,
} = require("./controller");
const { authenticateToken } = require("../../../middleware/auth");
const validateRequest = require("../../../middleware/validateRequest");
const {
    inventoryBatchSchema,
    batchUpdateSchema,
    batchConsumptionSchema,
    batchIdParamSchema,
    inventoryIdParamSchema,
    getExpiringBatchesSchema,
    batchAnalyticsSchema,
} = require("../../../validators/inventoryBatchSchema");

// Get all inventory batches with filtering
router.get("/", authenticateToken, (req, res) => {
    getInventoryBatchesController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Get expiring batches alert
router.get("/expiring", authenticateToken, validateRequest(getExpiringBatchesSchema), (req, res) => {
    getExpiringBatchesController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Get batches by inventory ID
router.get("/inventory/:inventory_id", authenticateToken, validateRequest(inventoryIdParamSchema), (req, res) => {
    getInventoryBatchesByInventoryIdController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Get batch movements/history
router.get("/:id/movements", authenticateToken, validateRequest(batchIdParamSchema), (req, res) => {
    getBatchMovementsController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Create new inventory batch
router.post("/", authenticateToken, validateRequest(inventoryBatchSchema), (req, res) => {
    createInventoryBatchController(req, (result) => {
        res.status(result.statusCode || 201).json(result);
    });
});

// Consume quantity from batches
router.post("/consume", authenticateToken, validateRequest(batchConsumptionSchema), (req, res) => {
    consumeFromBatchesController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Update inventory batch
router.put("/:id", authenticateToken, validateRequest(batchUpdateSchema), (req, res) => {
    updateInventoryBatchController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

router.get("/analytics/:restaurant_id", authenticateToken, validateRequest(batchAnalyticsSchema), (req, res) => {
    getBatchAnalyticsController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

module.exports = router;
