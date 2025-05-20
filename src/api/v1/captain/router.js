// src/api/v1/captain/router.js (Enhanced version)

const express = require("express");
const { 
    getRestaurantTablesController, 
    getPendingOrdersController,
    getActiveOrdersController,
    updateOrderStatusController,
    getPendingCaptainCallsController,
    updateCaptainCallController,
    getTablesWithOrdersStatsController
} = require("./controller");

const { checkUserAuthorized } = require("../../../helpers/common");
const { validateOrderStatus } = require("../../../validators/orderValidator");
const validateRequest = require("../../../middleware/validateRequest");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(checkUserAuthorized());

/**
 * @swagger
 * /api/captain/tables:
 *   get:
 *     summary: Get all tables for the restaurant
 *     description: Returns all tables with their status
 *     tags: [Captain]
 *     responses:
 *       200:
 *         description: List of tables
 */
router.get("/tables", (req, res) => {
    getRestaurantTablesController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/captain/orders/pending:
 *   get:
 *     summary: Get pending orders
 *     description: Returns all orders that need captain approval
 *     tags: [Captain]
 *     responses:
 *       200:
 *         description: List of pending orders
 */
router.get("/orders/pending", (req, res) => {
    getPendingOrdersController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/captain/orders/active:
 *   get:
 *     summary: Get active orders
 *     description: Returns all active orders (approved but not completed)
 *     tags: [Captain]
 *     responses:
 *       200:
 *         description: List of active orders
 */
router.get("/orders/active", (req, res) => {
    getActiveOrdersController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/captain/orders/{order_id}/status:
 *   put:
 *     summary: Update order status
 *     description: Update the status of an order
 *     tags: [Captain]
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status_id
 *             properties:
 *               status_id:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Order status updated successfully
 */
router.put("/orders/:order_id/status", validateRequest(validateOrderStatus), (req, res) => {
    updateOrderStatusController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/captain/calls:
 *   get:
 *     summary: Get pending captain calls
 *     description: Returns all pending captain calls
 *     tags: [Captain]
 *     responses:
 *       200:
 *         description: List of pending captain calls
 */
router.get("/calls", (req, res) => {
    getPendingCaptainCallsController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/captain/calls/{call_id}:
 *   put:
 *     summary: Update captain call status
 *     description: Update the status of a captain call
 *     tags: [Captain]
 *     parameters:
 *       - in: path
 *         name: call_id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [in_progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: Captain call updated successfully
 */
router.put("/calls/:call_id", (req, res) => {
    updateCaptainCallController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/captain/table-stats:
 *   get:
 *     summary: Get tables with orders statistics
 *     description: Returns statistics about tables and their orders
 *     tags: [Captain]
 *     responses:
 *       200:
 *         description: Table statistics
 */
router.get("/table-stats", (req, res) => {
    getTablesWithOrdersStatsController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;