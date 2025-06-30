const express = require("express");
const {
    getTablesController,
    getTableByIdController,
    createTablesController,
    updateTablesController,
    deleteTablesController,
    regenerateTableQRCodeController,
    updateTableStatusController,
    getTableStatisticsController,
} = require("./controller");

const { checkUserAuthorized } = require("../../../helpers/common");
const { requirePermission, requireAdmin, requireManagement } = require("../../../helpers/permissions");
const validateRequest = require("../../../middleware/validateRequest");

const {
    createTableSchema,
    updateTableSchema,
    tableIdParamSchema,
    getTablesQuerySchema,
    updateTableStatusSchema,
    regenerateQRSchema,
} = require("../../../validators/tableValidator.js");

const router = express.Router();

/**
 * @swagger
 * /api/v1/tables:
 *   get:
 *     summary: Get all tables
 *     description: Returns a paginated list of tables with optional filtering. Requires 'tables' read permission.
 *     tags: [Table Management]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of tables per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for table name or number
 *       - in: query
 *         name: restaurant_id
 *         schema:
 *           type: integer
 *         description: Filter by restaurant ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, occupied, reserved, maintenance]
 *         description: Filter by table status
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [id, number, name, seats, status, created_at]
 *           default: number
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of tables with pagination metadata
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
 *                   example: "Tables retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           restaurant_id:
 *                             type: integer
 *                           number:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           seats:
 *                             type: integer
 *                           status:
 *                             type: string
 *                           customer_count:
 *                             type: integer
 *                           restaurant_name:
 *                             type: string
 *                           qr_code:
 *                             type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current_page:
 *                           type: integer
 *                         total_pages:
 *                           type: integer
 *                         total_records:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         has_next:
 *                           type: boolean
 *                         has_prev:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get(
    "/",
    checkUserAuthorized(),
    requirePermission("tables", "read"),
    validateRequest(getTablesQuerySchema),
    (req, res) => {
        getTablesController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/tables/statistics:
 *   get:
 *     summary: Get table statistics
 *     description: Returns table statistics including counts by status and occupancy data.
 *     tags: [Table Analytics]
 *     parameters:
 *       - in: query
 *         name: restaurant_id
 *         schema:
 *           type: integer
 *         description: Restaurant ID (optional for restaurant admins)
 *     responses:
 *       200:
 *         description: Table statistics
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
 *                   example: "Table statistics retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_tables:
 *                       type: integer
 *                     available_tables:
 *                       type: integer
 *                     occupied_tables:
 *                       type: integer
 *                     reserved_tables:
 *                       type: integer
 *                     maintenance_tables:
 *                       type: integer
 *                     total_customers:
 *                       type: integer
 *                     avg_customers_per_table:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/statistics", checkUserAuthorized(), requirePermission("tables", "read"), (req, res) => {
    getTableStatisticsController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/tables/{id}:
 *   get:
 *     summary: Get table by ID
 *     description: Returns a specific table by its ID. Requires 'tables' read permission.
 *     tags: [Table Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Table details
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
 *                   example: "Table retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     restaurant_id:
 *                       type: integer
 *                     number:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     seats:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     customer_count:
 *                       type: integer
 *                     restaurant:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                     qr_code:
 *                       type: string
 *                     qr_created_at:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Table not found
 */
router.get(
    "/:id",
    checkUserAuthorized(),
    requirePermission("tables", "read"),
    validateRequest(tableIdParamSchema),
    (req, res) => {
        getTableByIdController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/tables:
 *   post:
 *     summary: Create a new table
 *     description: Creates a new table with QR code. Requires 'tables' create permission.
 *     tags: [Table Management]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_id
 *               - number
 *             properties:
 *               restaurant_id:
 *                 type: integer
 *                 description: Restaurant ID (optional for restaurant admins - uses their restaurant)
 *               number:
 *                 type: integer
 *                 description: Table number (must be unique within restaurant)
 *               name:
 *                 type: string
 *                 description: Table name (optional - defaults to "Table {number}")
 *               seats:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 description: Number of seats (optional - defaults to 4)
 *     responses:
 *       200:
 *         description: Table created successfully
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
 *                   example: "Table created successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     table_id:
 *                       type: integer
 *                     qr_code:
 *                       type: string
 *       400:
 *         description: Validation error or table number already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post(
    "/",
    checkUserAuthorized(),
    requirePermission("tables", "create"),
    validateRequest(createTableSchema),
    (req, res) => {
        createTablesController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/tables/{id}:
 *   put:
 *     summary: Update table
 *     description: Updates table information. Requires 'tables' update permission.
 *     tags: [Table Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Table name
 *               number:
 *                 type: integer
 *                 description: Table number
 *               seats:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 20
 *                 description: Number of seats
 *               status:
 *                 type: string
 *                 enum: [available, occupied, reserved, maintenance]
 *                 description: Table status
 *     responses:
 *       200:
 *         description: Table updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Table not found
 */
router.put(
    "/:id",
    checkUserAuthorized(),
    requirePermission("tables", "update"),
    validateRequest(updateTableSchema),
    (req, res) => {
        updateTablesController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/tables/{id}:
 *   delete:
 *     summary: Delete table
 *     description: Soft deletes a table. Requires 'tables' delete permission.
 *     tags: [Table Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     responses:
 *       200:
 *         description: Table deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Table not found
 */
router.delete(
    "/:id",
    checkUserAuthorized(),
    requirePermission("tables", "delete"),
    validateRequest(tableIdParamSchema),
    (req, res) => {
        deleteTablesController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/tables/{id}/regenerate-qr:
 *   post:
 *     summary: Regenerate QR code for a table
 *     description: Creates a new QR code for an existing table. Requires 'tables' update permission.
 *     tags: [Table Management]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
 *     responses:
 *       200:
 *         description: QR code regenerated successfully
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
 *                   example: "QR code regenerated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     table_id:
 *                       type: integer
 *                     table_number:
 *                       type: integer
 *                     table_name:
 *                       type: string
 *                     qr_code:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Table not found
 */
router.post(
    "/:id/regenerate-qr",
    checkUserAuthorized(),
    requirePermission("tables", "update"),
    validateRequest(regenerateQRSchema),
    (req, res) => {
        regenerateTableQRCodeController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/tables/{id}/status:
 *   put:
 *     summary: Update table status
 *     description: Updates table status and customer count. Used by captains to manage table availability.
 *     tags: [Table Operations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Table ID
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
 *                 enum: [available, occupied, reserved, maintenance]
 *                 description: New table status
 *               customer_count:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 20
 *                 description: Number of customers at table
 *     responses:
 *       200:
 *         description: Table status updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Table not found
 */
router.put(
    "/:id/status",
    checkUserAuthorized(),
    requirePermission("tables", "update"),
    validateRequest(updateTableStatusSchema),
    (req, res) => {
        updateTableStatusController(req, (result) => {
            res.json(result);
        });
    }
);

module.exports = router;
