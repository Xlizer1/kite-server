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
    checkStockAvailabilityController,
    getInventoryDashboardController,
} = require("./controller");
const { authenticateToken } = require("../../../middleware/auth");
const validateRequest = require("../../../middleware/validateRequest");
const { inventorySchema, stockAvailabilitySchema } = require("../../../validators/inventorySchema");

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

router.get("/:inventory_id/availability", authenticateToken, validateRequest(stockAvailabilitySchema), (req, res) => {
    checkStockAvailabilityController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

/**
 * @swagger
 * /api/v1/inventory/dashboard/{restaurant_id}:
 *   get:
 *     summary: Get inventory dashboard data
 *     description: Get combined dashboard data - low stock, expiring batches, recent movements
 *     tags: [Inventory]
 *     parameters:
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dashboard data
 */
router.get("/dashboard/:restaurant_id", authenticateToken, (req, res) => {
    getInventoryDashboardController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

/**
 * Alternative route for current user's restaurant dashboard
 */
router.get("/dashboard", authenticateToken, (req, res) => {
    getInventoryDashboardController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

module.exports = router;
