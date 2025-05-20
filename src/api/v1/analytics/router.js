// src/api/v1/analytics/router.js

const express = require("express");
const { 
    getDailySalesController,
    getSalesByCategoryController,
    getTopSellingItemsController,
    getHourlySalesController,
    getInventoryUsageController,
    getDashboardSummaryController,
    getRevenueComparisonController
} = require("./controller");

const { checkUserAuthorized } = require("../../../helpers/common");

const router = express.Router();

// Apply authentication middleware to all routes
router.use(checkUserAuthorized());

/**
 * @swagger
 * /api/analytics/dashboard:
 *   get:
 *     summary: Get dashboard summary
 *     description: Returns summary data for the dashboard
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: restaurant_id
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: Dashboard summary data
 */
router.get("/dashboard", (req, res) => {
    getDashboardSummaryController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/analytics/daily-sales:
 *   get:
 *     summary: Get daily sales data
 *     description: Returns sales data by day for a date range
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: restaurant_id
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Daily sales data
 */
router.get("/daily-sales", (req, res) => {
    getDailySalesController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/analytics/sales-by-category:
 *   get:
 *     summary: Get sales by category
 *     description: Returns sales data grouped by category
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: restaurant_id
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Sales by category data
 */
router.get("/sales-by-category", (req, res) => {
    getSalesByCategoryController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/analytics/top-selling-items:
 *   get:
 *     summary: Get top selling items
 *     description: Returns top selling items for a date range
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: restaurant_id
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items to return (default 10)
 *     responses:
 *       200:
 *         description: Top selling items data
 */
router.get("/top-selling-items", (req, res) => {
    getTopSellingItemsController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/analytics/hourly-sales:
 *   get:
 *     summary: Get hourly sales distribution
 *     description: Returns sales data by hour for a date range
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: restaurant_id
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Hourly sales data
 */
router.get("/hourly-sales", (req, res) => {
    getHourlySalesController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/analytics/inventory-usage:
 *   get:
 *     summary: Get inventory usage report
 *     description: Returns inventory usage data for a date range
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: restaurant_id
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: End date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Inventory usage data
 */
router.get("/inventory-usage", (req, res) => {
    getInventoryUsageController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/analytics/revenue-comparison:
 *   get:
 *     summary: Get revenue comparison
 *     description: Returns revenue comparison between current and previous periods
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: restaurant_id
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month]
 *         description: Period type (day, week, month)
 *       - in: query
 *         name: start_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Custom start date (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         schema:
 *           type: string
 *           format: date
 *         description: Custom end date (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Revenue comparison data
 */
router.get("/revenue-comparison", (req, res) => {
    getRevenueComparisonController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;