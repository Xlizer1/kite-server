const express = require("express");
const { 
    getRestaurantTablesController, 
    getPendingOrdersController,
    getActiveOrdersController,
    updateOrderStatusController,
    getPendingCaptainCallsController,
    updateCaptainCallController,
    getTablesWithOrdersStatsController,
    createOrderForTableController,
    getMenuForOrderingController,
    assignCaptainToTablesController,
    updateTableStatusController,
    getCaptainDashboardController
} = require("./controller");

const { checkUserAuthorized } = require("../../../helpers/common");
const { validateOrderStatus } = require("../../../validators/orderValidator");
const validateRequest = require("../../../middleware/validateRequest");
const { createOrderForTableSchema } = require("../../../validators/captainOrderValidator");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(checkUserAuthorized());

/**
 * @swagger
 * /api/v1/captain/tables:
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
 * /api/v1/captain/orders/pending:
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
 * /api/v1/captain/orders/active:
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
 * /api/v1/captain/orders/{order_id}/status:
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
 * /api/v1/captain/calls:
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
 * /api/v1/captain/calls/{call_id}:
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
 * /api/v1/captain/table-stats:
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

/**
 * @swagger
 * /api/v1/captain/menu:
 *   get:
 *     summary: Get menu for ordering
 *     description: Returns the complete menu organized by categories for captain ordering
 *     tags: [Captain]
 *     responses:
 *       200:
 *         description: Menu retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       sub_categories:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                             name:
 *                               type: string
 *                             items:
 *                               type: array
 */
router.get("/menu", (req, res) => {
    getMenuForOrderingController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/captain/orders:
 *   post:
 *     summary: Create order for table
 *     description: Allows captain to create an order directly for any table
 *     tags: [Captain]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - table_id
 *               - items
 *             properties:
 *               table_id:
 *                 type: integer
 *                 description: ID of the table to create order for
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - item_id
 *                     - quantity
 *                   properties:
 *                     item_id:
 *                       type: integer
 *                       description: Menu item ID
 *                     quantity:
 *                       type: integer
 *                       minimum: 1
 *                       description: Quantity of the item
 *                     special_instructions:
 *                       type: string
 *                       description: Special instructions for the item
 *               special_request:
 *                 type: string
 *                 description: Special request for the entire order
 *               allergy_info:
 *                 type: string
 *                 description: Allergy information
 *               customer_name:
 *                 type: string
 *                 description: Customer name (optional)
 *     responses:
 *       200:
 *         description: Order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     order_id:
 *                       type: integer
 *                     table_number:
 *                       type: integer
 *                     total_items:
 *                       type: integer
 *                     created_by:
 *                       type: string
 *       400:
 *         description: Invalid input
 *       403:
 *         description: Insufficient permissions
 */
router.post("/orders", validateRequest(createOrderForTableSchema), (req, res) => {
    createOrderForTableController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/captain/dashboard:
 *   get:
 *     summary: Get captain dashboard summary
 *     description: Returns summary statistics and recent activities for captain dashboard
 *     tags: [Captain]
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 */
router.get("/dashboard", (req, res) => {
    getCaptainDashboardController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/captain/tables/{table_id}/status:
 *   put:
 *     summary: Update table status
 *     description: Updates the status of a specific table (free, occupied, etc.)
 *     tags: [Captain]
 *     parameters:
 *       - in: path
 *         name: table_id
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
 *                 type: integer
 *                 enum: [1, 2, 3, 4]
 *                 description: 1=free, 2=occupied, 3=reserved, 4=cleaning
 *               customer_count:
 *                 type: integer
 *                 description: Number of customers at the table
 *               notes:
 *                 type: string
 *                 description: Additional notes about the status change
 *     responses:
 *       200:
 *         description: Table status updated successfully
 */
router.put("/tables/:table_id/status", (req, res) => {
    updateTableStatusController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/captain/assign-tables:
 *   post:
 *     summary: Assign captain to tables
 *     description: Assigns the current captain to specific tables
 *     tags: [Captain]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - table_ids
 *             properties:
 *               table_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of table IDs to assign to the captain
 *     responses:
 *       200:
 *         description: Tables assigned successfully
 */
router.post("/assign-tables", (req, res) => {
    assignCaptainToTablesController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;