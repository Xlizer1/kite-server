// src/api/v1/cashier/router.js

const express = require("express");
const { 
    getTablesWithActiveBillsController,
    getOrdersForBillingController,
    getAvailableDiscountsController,
    createInvoiceController,
    getInvoiceDetailsController,
    generateReceiptPdfController,
    getCashierReportController
} = require("./controller");

const { checkUserAuthorized } = require("../../../helpers/common");
const validateRequest = require("../../../middleware/validateRequest");
const { createInvoiceSchema } = require("../../../validators/cashierValidator");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(checkUserAuthorized());

/**
 * @swagger
 * /api/v1/cashier/tables:
 *   get:
 *     summary: Get tables with active bills
 *     description: Returns tables that have orders ready for billing
 *     tags: [Cashier]
 *     responses:
 *       200:
 *         description: List of tables with active bills
 */
router.get("/tables", (req, res) => {
    getTablesWithActiveBillsController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/cashier/table/{table_id}/orders:
 *   get:
 *     summary: Get orders for billing
 *     description: Returns all orders ready for billing for a specific table
 *     tags: [Cashier]
 *     parameters:
 *       - in: path
 *         name: table_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of orders ready for billing
 */
router.get("/table/:table_id/orders", (req, res) => {
    getOrdersForBillingController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/cashier/discounts:
 *   get:
 *     summary: Get available discounts
 *     description: Returns all available discounts for the restaurant
 *     tags: [Cashier]
 *     responses:
 *       200:
 *         description: List of available discounts
 */
router.get("/discounts", (req, res) => {
    getAvailableDiscountsController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/cashier/invoice:
 *   post:
 *     summary: Create invoice
 *     description: Creates an invoice for one or more orders
 *     tags: [Cashier]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - order_ids
 *               - payment_method_id
 *               - payment_status_id
 *             properties:
 *               order_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               discount_id:
 *                 type: integer
 *               payment_method_id:
 *                 type: integer
 *               payment_status_id:
 *                 type: integer
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invoice created successfully
 */
router.post("/invoice", validateRequest(createInvoiceSchema), (req, res) => {
    createInvoiceController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/cashier/invoice/{invoice_id}:
 *   get:
 *     summary: Get invoice details
 *     description: Returns details for a specific invoice
 *     tags: [Cashier]
 *     parameters:
 *       - in: path
 *         name: invoice_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Invoice details
 */
router.get("/invoice/:invoice_id", (req, res) => {
    getInvoiceDetailsController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/cashier/invoice/{invoice_id}/receipt:
 *   post:
 *     summary: Generate receipt PDF
 *     description: Generates a PDF receipt for a specific invoice
 *     tags: [Cashier]
 *     parameters:
 *       - in: path
 *         name: invoice_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Receipt generated successfully
 */
router.post("/invoice/:invoice_id/receipt", (req, res) => {
    generateReceiptPdfController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/cashier/report:
 *   get:
 *     summary: Get cashier sales report
 *     description: Returns a sales report for a specific date
 *     tags: [Cashier]
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Date to generate report for (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Sales report
 */
router.get("/report", (req, res) => {
    getCashierReportController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;