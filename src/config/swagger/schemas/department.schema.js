// src/config/swagger/schemas/department.schema.js

/**
 * @swagger
 * components:
 *   schemas:
 *     Department:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The department ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Name of the department
 *           example: "Admin"
 *       required:
 *         - id
 *         - name
 *     
 *     DepartmentStats:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The department ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Name of the department
 *           example: "Admin"
 *         total_users:
 *           type: integer
 *           description: Total number of users in the department
 *           example: 15
 *         active_users:
 *           type: integer
 *           description: Number of active users in the department
 *           example: 12
 *         inactive_users:
 *           type: integer
 *           description: Number of inactive users in the department
 *           example: 3
 *         recently_active_users:
 *           type: integer
 *           description: Number of users who were active in the last 30 days
 *           example: 10
 *       required:
 *         - id
 *         - name
 *         - total_users
 *         - active_users
 *         - inactive_users
 *         - recently_active_users
 *     
 *     DepartmentCreate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Name of the department
 *           example: "Marketing"
 *       required:
 *         - name
 *     
 *     DepartmentUpdate:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Updated name of the department
 *           example: "Marketing Department"
 *       required:
 *         - name
 *     
 *     DepartmentSelection:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The department ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Name of the department
 *           example: "Admin"
 *         value:
 *           type: integer
 *           description: Value for form selections (same as id)
 *           example: 1
 *         label:
 *           type: string
 *           description: Label for form selections (same as name)
 *           example: "Admin"
 *       required:
 *         - id
 *         - name
 *         - value
 *         - label
 *     
 *     DepartmentStatsResponse:
 *       type: object
 *       properties:
 *         departments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/DepartmentStats'
 *           description: List of departments with statistics
 *         summary:
 *           type: object
 *           properties:
 *             total_users:
 *               type: integer
 *               description: Total users across all departments
 *               example: 50
 *             active_users:
 *               type: integer
 *               description: Active users across all departments
 *               example: 42
 *             inactive_users:
 *               type: integer
 *               description: Inactive users across all departments
 *               example: 8
 *             recently_active_users:
 *               type: integer
 *               description: Recently active users across all departments
 *               example: 35
 *           required:
 *             - total_users
 *             - active_users
 *             - inactive_users
 *             - recently_active_users
 *       required:
 *         - departments
 *         - summary
 */