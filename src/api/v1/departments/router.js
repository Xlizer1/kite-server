// src/api/v1/departments/router.js

const express = require("express");
const {
    getDepartmentsController,
    getDepartmentByIdController,
    createDepartmentController,
    updateDepartmentController,
    deleteDepartmentController,
    getDepartmentUsersController,
    getDepartmentStatsController,
    getDepartmentsForSelectionController
} = require("./controller");
const { checkUserAuthorized } = require("../../../helpers/common");
const { requireAdmin, requireManagement } = require("../../../helpers/permissions");
const validateRequest = require("../../../middleware/validateRequest");
const {
    createDepartmentSchema,
    updateDepartmentSchema,
    departmentIdParamSchema,
    getDepartmentUsersSchema
} = require("../../../validators/departmentValidator");

const router = express.Router();

/**
 * @swagger
 * /api/v1/departments:
 *   get:
 *     summary: Get all departments
 *     description: Retrieves a list of all departments with optional filtering and pagination. Accessible to all authenticated users.
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
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
 *           default: 50
 *         description: Number of departments per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for department name
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [id, name, user_count]
 *           default: id
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: ASC
 *         description: Sort order
 *       - in: query
 *         name: include_user_count
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include user count for each department
 *     responses:
 *       200:
 *         description: List of departments with pagination metadata
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
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Department'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", checkUserAuthorized(), (req, res) => {
    getDepartmentsController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/departments/selection:
 *   get:
 *     summary: Get departments for selection
 *     description: Retrieves a simplified list of departments for dropdowns and selection inputs
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of department options
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
 *                       value:
 *                         type: integer
 *                       label:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/selection", checkUserAuthorized(), (req, res) => {
    getDepartmentsForSelectionController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/departments/stats:
 *   get:
 *     summary: Get department statistics
 *     description: Retrieves statistics for all departments including user counts. Requires admin or management access.
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Department statistics
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
 *                     departments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/DepartmentStats'
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_users:
 *                           type: integer
 *                         active_users:
 *                           type: integer
 *                         inactive_users:
 *                           type: integer
 *                         recently_active_users:
 *                           type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/stats", checkUserAuthorized(), requireManagement, (req, res) => {
    getDepartmentStatsController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     description: Retrieves a specific department by its ID with detailed information including user counts
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department details
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
 *                   $ref: '#/components/schemas/DepartmentStats'
 *       400:
 *         description: Invalid department ID
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Department not found
 */
router.get("/:id", checkUserAuthorized(), validateRequest(departmentIdParamSchema), (req, res) => {
    getDepartmentByIdController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/departments:
 *   post:
 *     summary: Create new department
 *     description: Creates a new department. Only administrators can create departments.
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "Marketing"
 *                 description: Name of the department
 *     responses:
 *       201:
 *         description: Department created successfully
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
 *                   $ref: '#/components/schemas/Department'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       409:
 *         description: Department name already exists
 */
router.post("/", checkUserAuthorized(), requireAdmin, validateRequest(createDepartmentSchema), (req, res) => {
    createDepartmentController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   put:
 *     summary: Update department
 *     description: Updates an existing department. Only administrators can update departments.
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 example: "Marketing"
 *                 description: Updated name of the department
 *     responses:
 *       200:
 *         description: Department updated successfully
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
 *                   $ref: '#/components/schemas/Department'
 *       400:
 *         description: Validation error or cannot modify critical system departments
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Department not found
 *       409:
 *         description: Department name already exists
 */
router.put("/:id", checkUserAuthorized(), requireAdmin, validateRequest(updateDepartmentSchema), (req, res) => {
    updateDepartmentController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/departments/{id}:
 *   delete:
 *     summary: Delete department
 *     description: Deletes a department with safety checks. Only administrators can delete departments.
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department deleted successfully
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
 *       400:
 *         description: Cannot delete department with active users or critical system departments
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Department not found
 */
router.delete("/:id", checkUserAuthorized(), requireAdmin, validateRequest(departmentIdParamSchema), (req, res) => {
    deleteDepartmentController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/departments/{id}/users:
 *   get:
 *     summary: Get users in department
 *     description: Retrieves users in a specific department with pagination. Requires admin or management access.
 *     tags: [Departments]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Department ID
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
 *         description: Number of users per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [enabled, disabled]
 *         description: Filter by user status
 *     responses:
 *       200:
 *         description: List of users in the department
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
 *                     department:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Invalid department ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Department not found
 */
router.get("/:id/users", checkUserAuthorized(), requireManagement, validateRequest(getDepartmentUsersSchema), (req, res) => {
    getDepartmentUsersController(req, (result) => {
        res.json(result);
    });
});

module.exports = router;