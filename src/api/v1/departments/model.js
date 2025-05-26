// src/api/v1/departments/model.js

const { executeQuery, buildInsertQuery, buildUpdateQuery } = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");

/**
 * Get all departments with optional filtering and pagination
 * @param {Object} request - Request object with query parameters
 * @returns {Object} - Departments with pagination info
 */
const getDepartmentsModel = async (request) => {
    try {
        const {
            page = 1,
            limit = 50, // Higher default limit since departments are usually few
            search = "",
            sort_by = "id",
            sort_order = "ASC",
            include_user_count = false
        } = request.query || {};

        // Calculate pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        // Build dynamic WHERE conditions
        const conditions = [];
        const params = [];

        // Search filter (searches in department name)
        if (search && search.trim()) {
            conditions.push(`d.name LIKE ?`);
            params.push(`%${search.trim()}%`);
        }

        // Validate sort fields to prevent SQL injection
        const allowedSortFields = ["id", "name", "user_count"];
        const sortField = allowedSortFields.includes(sort_by) ? sort_by : "id";
        const sortDirection = sort_order.toUpperCase() === "DESC" ? "DESC" : "ASC";

        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

        // Build query based on whether user count is requested
        let dataQuery;
        if (include_user_count === 'true') {
            dataQuery = `
                SELECT 
                    d.id,
                    d.name,
                    COUNT(u.id) as user_count,
                    COUNT(CASE WHEN u.enabled = 1 AND u.deleted_at IS NULL THEN 1 END) as active_user_count
                FROM 
                    departments d
                LEFT JOIN users u ON d.id = u.department_id AND u.deleted_at IS NULL
                ${whereClause}
                GROUP BY d.id, d.name
                ORDER BY 
                    ${sortField === 'user_count' ? 'user_count' : `d.${sortField}`} ${sortDirection}
                LIMIT ? OFFSET ?
            `;
        } else {
            dataQuery = `
                SELECT 
                    d.id,
                    d.name
                FROM 
                    departments d
                ${whereClause}
                ORDER BY 
                    d.${sortField} ${sortDirection}
                LIMIT ? OFFSET ?
            `;
        }

        // Count query for total records
        const countQuery = `
            SELECT COUNT(d.id) as total
            FROM departments d
            ${whereClause}
        `;

        // Execute both queries
        const dataParams = [...params, limitNum, offset];
        const countParams = [...params];

        const [result, countResult] = await Promise.all([
            executeQuery(dataQuery, dataParams),
            executeQuery(countQuery, countParams),
        ]);

        const total = countResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limitNum);

        return {
            data: result || [],
            pagination: {
                current_page: parseInt(page),
                total_pages: totalPages,
                total_records: total,
                limit: limitNum,
                has_next: parseInt(page) < totalPages,
                has_prev: parseInt(page) > 1,
            },
            filters: {
                search,
                sort_by: sortField,
                sort_order: sortDirection,
                include_user_count
            },
        };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Get department by ID
 * @param {number} id - Department ID
 * @returns {Object|null} - Department object or null
 */
const getDepartmentByIdModel = async (id) => {
    try {
        const sql = `
            SELECT 
                d.id,
                d.name,
                COUNT(u.id) as total_users,
                COUNT(CASE WHEN u.enabled = 1 AND u.deleted_at IS NULL THEN 1 END) as active_users,
                COUNT(CASE WHEN u.enabled = 0 AND u.deleted_at IS NULL THEN 1 END) as inactive_users
            FROM 
                departments d
            LEFT JOIN users u ON d.id = u.department_id AND u.deleted_at IS NULL
            WHERE 
                d.id = ?
            GROUP BY d.id, d.name
        `;

        const result = await executeQuery(sql, [id], "getDepartmentById");
        return result?.[0] || null;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Create new department
 * @param {Object} departmentData - Department data
 * @returns {Object} - Created department info
 */
const createDepartmentModel = async (departmentData) => {
    try {
        const { name } = departmentData;

        // Check if department name already exists
        const existingDept = await getDepartmentByNameModel(name);
        if (existingDept) {
            throw new CustomError("Department name already exists", 409);
        }

        const { sql, params } = buildInsertQuery("departments", { name });
        const result = await executeQuery(sql, params, "createDepartment");

        if (result.insertId) {
            return {
                status: true,
                department_id: result.insertId,
                department: await getDepartmentByIdModel(result.insertId)
            };
        } else {
            throw new CustomError("Failed to create department", 500);
        }
    } catch (error) {
        throw new CustomError(error.message, error.statusCode || 500);
    }
};

/**
 * Update department
 * @param {number} id - Department ID
 * @param {Object} departmentData - Updated department data
 * @returns {Object} - Update result
 */
const updateDepartmentModel = async (id, departmentData) => {
    try {
        const { name } = departmentData;

        // Check if department exists
        const existingDept = await getDepartmentByIdModel(id);
        if (!existingDept) {
            throw new CustomError("Department not found", 404);
        }

        // Check if new name conflicts with existing department (excluding current)
        const nameConflict = await executeQuery(
            "SELECT id FROM departments WHERE name = ? AND id != ?",
            [name, id],
            "checkDepartmentNameConflict"
        );

        if (nameConflict.length > 0) {
            throw new CustomError("Department name already exists", 409);
        }

        const { sql, params } = buildUpdateQuery("departments", { name }, { id });
        const result = await executeQuery(sql, params, "updateDepartment");

        if (result.affectedRows > 0) {
            return {
                status: true,
                department: await getDepartmentByIdModel(id)
            };
        } else {
            throw new CustomError("Failed to update department", 500);
        }
    } catch (error) {
        throw new CustomError(error.message, error.statusCode || 500);
    }
};

/**
 * Delete department (with safety checks)
 * @param {number} id - Department ID
 * @returns {Object} - Delete result
 */
const deleteDepartmentModel = async (id) => {
    try {
        // Check if department exists
        const department = await getDepartmentByIdModel(id);
        if (!department) {
            throw new CustomError("Department not found", 404);
        }

        // Prevent deletion of critical departments (Admin, etc.)
        const criticalDepartments = [1]; // Admin department
        if (criticalDepartments.includes(parseInt(id))) {
            throw new CustomError("Cannot delete critical system departments", 400);
        }

        // Check if department has active users
        if (department.active_users > 0) {
            throw new CustomError(
                `Cannot delete department. It has ${department.active_users} active users. Please reassign users first.`,
                400
            );
        }

        // If there are inactive users, we could either:
        // 1. Prevent deletion
        // 2. Reassign them to a default department
        // For safety, let's prevent deletion if ANY users exist
        if (department.total_users > 0) {
            throw new CustomError(
                `Cannot delete department. It has ${department.total_users} users (including inactive). Please reassign all users first.`,
                400
            );
        }

        const sql = "DELETE FROM departments WHERE id = ?";
        const result = await executeQuery(sql, [id], "deleteDepartment");

        if (result.affectedRows > 0) {
            return {
                status: true,
                message: `Department '${department.name}' deleted successfully`
            };
        } else {
            throw new CustomError("Failed to delete department", 500);
        }
    } catch (error) {
        throw new CustomError(error.message, error.statusCode || 500);
    }
};

/**
 * Get department by name
 * @param {string} name - Department name
 * @returns {Object|null} - Department object or null
 */
const getDepartmentByNameModel = async (name) => {
    try {
        const sql = "SELECT * FROM departments WHERE name = ?";
        const result = await executeQuery(sql, [name], "getDepartmentByName");
        return result?.[0] || null;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Get users in a specific department
 * @param {number} departmentId - Department ID
 * @param {Object} options - Query options (page, limit, etc.)
 * @returns {Object} - Users in department with pagination
 */
const getDepartmentUsersModel = async (departmentId, options = {}) => {
    try {
        const {
            page = 1,
            limit = 10,
            status = "" // 'enabled', 'disabled', or empty for all
        } = options;

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        // Build conditions
        const conditions = ["u.department_id = ?", "u.deleted_at IS NULL"];
        const params = [departmentId];

        // Status filter
        if (status === "enabled" || status === "disabled") {
            const enabledValue = status === "enabled" ? 1 : 0;
            conditions.push("u.enabled = ?");
            params.push(enabledValue);
        }

        const whereClause = conditions.join(" AND ");

        // Data query
        const dataQuery = `
            SELECT 
                u.id,
                u.name,
                u.username,
                u.email,
                u.phone,
                u.enabled,
                u.last_login,
                u.created_at,
                r.name as restaurant_name
            FROM users u
            LEFT JOIN restaurants r ON u.restaurant_id = r.id
            WHERE ${whereClause}
            ORDER BY u.name ASC
            LIMIT ? OFFSET ?
        `;

        // Count query
        const countQuery = `
            SELECT COUNT(u.id) as total
            FROM users u
            WHERE ${whereClause}
        `;

        const dataParams = [...params, limitNum, offset];
        const countParams = [...params];

        const [users, countResult] = await Promise.all([
            executeQuery(dataQuery, dataParams),
            executeQuery(countQuery, countParams),
        ]);

        const total = countResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limitNum);

        return {
            data: users || [],
            pagination: {
                current_page: parseInt(page),
                total_pages: totalPages,
                total_records: total,
                limit: limitNum,
                has_next: parseInt(page) < totalPages,
                has_prev: parseInt(page) > 1,
            }
        };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Get department statistics
 * @returns {Object} - Department statistics
 */
const getDepartmentStatsModel = async () => {
    try {
        const sql = `
            SELECT 
                d.id,
                d.name,
                COUNT(u.id) as total_users,
                COUNT(CASE WHEN u.enabled = 1 AND u.deleted_at IS NULL THEN 1 END) as active_users,
                COUNT(CASE WHEN u.enabled = 0 AND u.deleted_at IS NULL THEN 1 END) as inactive_users,
                COUNT(CASE WHEN u.last_login >= DATE_SUB(NOW(), INTERVAL 30 DAY) AND u.deleted_at IS NULL THEN 1 END) as recently_active_users
            FROM departments d
            LEFT JOIN users u ON d.id = u.department_id AND u.deleted_at IS NULL
            GROUP BY d.id, d.name
            ORDER BY d.id ASC
        `;

        const result = await executeQuery(sql, [], "getDepartmentStats");
        
        // Calculate totals
        const totals = result.reduce((acc, dept) => {
            acc.total_users += dept.total_users;
            acc.active_users += dept.active_users;
            acc.inactive_users += dept.inactive_users;
            acc.recently_active_users += dept.recently_active_users;
            return acc;
        }, {
            total_users: 0,
            active_users: 0,
            inactive_users: 0,
            recently_active_users: 0
        });

        return {
            departments: result,
            summary: totals
        };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

module.exports = {
    getDepartmentsModel,
    getDepartmentByIdModel,
    createDepartmentModel,
    updateDepartmentModel,
    deleteDepartmentModel,
    getDepartmentByNameModel,
    getDepartmentUsersModel,
    getDepartmentStatsModel
};