// src/api/v1/kitchen/router.js

const express = require("express");
const { 
    getPendingKitchenOrdersController,
    getInProgressKitchenOrdersController,
    startProcessingOrderController,
    completeOrderController,
    getLowInventoryItemsController,
    getKitchenOrderHistoryController
} = require("./controller");

const { checkUserAuthorized } = require("../../../helpers/common");
const validateRequest = require("../../../middleware/validateRequest");
const { startProcessingOrderSchema, completeOrderSchema } = require("../../../validators/kitchenValidator");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(checkUserAuthorized());

/**
 * @swagger
 * /api/v1/kitchen/orders/pending:
 *   get:
 *     summary: Get pending kitchen orders
 *     description: Returns all orders approved by captains and ready for kitchen processing
 *     tags: [Kitchen]
 *     responses:
 *       200:
 *         description: List of pending kitchen orders
 */
router.get("/orders/pending", (req, res) => {
    getPendingKitchenOrdersController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/kitchen/orders/in-progress:
 *   get:
 *     summary: Get in-progress kitchen orders
 *     description: Returns all orders currently being prepared in the kitchen
 *     tags: [Kitchen]
 *     responses:
 *       200:
 *         description: List of in-progress kitchen orders
 */
router.get("/orders/in-progress", (req, res) => {
    getInProgressKitchenOrdersController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/kitchen/orders/{order_id}/start:
 *   post:
 *     summary: Start processing an order
 *     description: Start processing an order in the kitchen
 *     tags: [Kitchen]
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estimated_minutes:
 *                 type: integer
 *                 description: Estimated preparation time in minutes
 *     responses:
 *       200:
 *         description: Order processing started successfully
 */
router.post("/orders/:order_id/start", validateRequest(startProcessingOrderSchema), (req, res) => {
    startProcessingOrderController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/kitchen/orders/{order_id}/complete:
 *   post:
 *     summary: Complete an order
 *     description: Mark an order as completed in the kitchen
 *     tags: [Kitchen]
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notes:
 *                 type: string
 *                 description: Notes about the completed order
 *     responses:
 *       200:
 *         description: Order completed successfully
 */
router.post("/orders/:order_id/complete", validateRequest(completeOrderSchema), (req, res) => {
    completeOrderController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/kitchen/inventory/low:
 *   get:
 *     summary: Get low inventory items
 *     description: Returns inventory items that are below their threshold
 *     tags: [Kitchen]
 *     responses:
 *       200:
 *         description: List of low inventory items
 */
router.get("/inventory/low", (req, res) => {
    getLowInventoryItemsController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/kitchen/history:
 *   get:
 *     summary: Get kitchen order history
 *     description: Returns completed kitchen orders
 *     tags: [Kitchen]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to filter by (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of orders to return
 *     responses:
 *       200:
 *         description: Kitchen order history
 */
router.get("/history", (req, res) => {
    getKitchenOrderHistoryController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;