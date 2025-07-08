const express = require("express");
const {
    getPendingKitchenOrdersController,
    getInProgressKitchenOrdersController,
    startProcessingOrderController,
    completeOrderController,
    getLowInventoryItemsController,
    getKitchenOrderHistoryController,
    getKitchenOrdersWithIngredientsController,
    startOrderPreparationController,
    getKitchenInventoryAlertsController,
    validateOrderIngredientsController,
} = require("./controller");

const { checkUserAuthorized } = require("../../../helpers/common");
const validateRequest = require("../../../middleware/validateRequest");
const {
    startProcessingOrderSchema,
    completeOrderSchema,
    orderIdParamSchema,
} = require("../../../validators/kitchenValidator");

const router = express.Router();

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
 * /api/v1/kitchen/orders/{order_id}/validate:
 *   get:
 *     summary: Validate order ingredients availability
 *     description: Check if order can be prepared with current batch inventory using FIFO
 *     tags: [Kitchen]
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Order validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     canPrepare:
 *                       type: boolean
 *                     shortages:
 *                       type: array
 */
router.get("/orders/:order_id/validate", (req, res) => {
    validateOrderIngredientsController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/kitchen/orders/{order_id}/details:
 *   get:
 *     summary: Get detailed order preparation information
 *     description: Get order with ingredient breakdown and batch consumption plan
 *     tags: [Kitchen]
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detailed order preparation info
 */
router.get("/orders/:order_id/details", (req, res) => {
    getOrderPreparationDetailsController(req, (result) => {
        res.json(result);
    });
});

router.get("/orders-with-ingredients", (req, res) => {
    getKitchenOrdersWithIngredientsController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Start order preparation with ingredient consumption
router.post("/start-preparation", validateRequest(startProcessingOrderSchema), (req, res) => {
    startOrderPreparationController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Get kitchen inventory alerts (low stock and expiring items)
router.get("/inventory-alerts", (req, res) => {
    getKitchenInventoryAlertsController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

router.get("/inventory/low", (req, res) => {
    getLowInventoryItemsController(req, (result) => {
        res.json(result);
    });
});

router.get("/history", (req, res) => {
    getKitchenOrderHistoryController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;
