const express = require("express");
const router = express.Router();
const {
    getInventoryItemsController,
    getInventoryItemsByRestaurantIDController,
    getLowStockItemsController,
    createInventoryItemController,
    updateInventoryItemController,
    deleteInventoryItemController,
    getInventoryHistoryController,
    getInventoryWithBatchesByRestaurantController,
} = require("./controller");
const { authenticateToken } = require("../../../middleware/auth");
const validateRequest = require("../../../middleware/validateRequest");
const { inventorySchema } = require("../../../validators/inventorySchema");

// Get all inventory items
router.get("/", authenticateToken, (req, res) => {
    getInventoryItemsController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Get inventory items by restaurant
router.get("/restaurant/:restaurant_id", authenticateToken, (req, res) => {
    getInventoryItemsByRestaurantIDController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Get low stock items by restaurant
router.get("/low-stock/:restaurant_id", authenticateToken, (req, res) => {
    getLowStockItemsController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Get inventory history
router.get("/history/:id", authenticateToken, (req, res) => {
    getInventoryHistoryController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Create new inventory item
router.post("/", authenticateToken, validateRequest(inventorySchema), (req, res) => {
    createInventoryItemController(req, (result) => {
        res.status(result.statusCode || 201).json(result);
    });
});

// Update inventory item
router.put("/:id", authenticateToken, validateRequest(inventorySchema), (req, res) => {
    updateInventoryItemController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Delete inventory item
router.delete("/:id", authenticateToken, (req, res) => {
    deleteInventoryItemController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Get inventory with batches for restaurant (paginated)
router.get("/restaurant/:restaurant_id/with-batches", authenticateToken, (req, res) => {
    getInventoryWithBatchesByRestaurantController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Alternative route for current user's restaurant
router.get("/with-batches", authenticateToken, (req, res) => {
    getInventoryWithBatchesByRestaurantController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

module.exports = router;
