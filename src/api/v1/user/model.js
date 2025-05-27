// Updated src/api/v1/user/model.js - Simplified for department-based system

const { hash, executeQuery, buildInsertQuery, buildUpdateQuery } = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");

const getUsers = async (request) => {
    try {
        // Extract query parameters with defaults
        const {
            page = 1,
            limit = 10,
            search = "",
            department_id = "",
            status = "", // 'enabled', 'disabled', or empty for all
            sort_by = "created_at",
            sort_order = "DESC",
        } = request.query || {};

        // Calculate pagination
        const offset = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        // Build dynamic WHERE conditions
        const conditions = ["u.deleted_at IS NULL"];
        const params = [];

        // Search filter (searches in name, username, email)
        if (search && search.trim()) {
            conditions.push(`(
              u.name LIKE ? OR 
              u.username LIKE ? OR 
              u.email LIKE ?
            )`);
            const searchParam = `%${search.trim()}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        // Department filter
        if (department_id && department_id !== "") {
            conditions.push("u.department_id = ?");
            params.push(parseInt(department_id));
        }

        // Status filter
        if (status && (status === "enabled" || status === "disabled")) {
            const enabledValue = status === "enabled" ? 1 : 0;
            conditions.push("u.enabled = ?");
            params.push(enabledValue);
        }

        // Validate sort fields to prevent SQL injection
        const allowedSortFields = ["id", "name", "username", "email", "created_at", "updated_at", "department"];
        const sortField = allowedSortFields.includes(sort_by) ? sort_by : "created_at";
        const sortDirection = sort_order.toUpperCase() === "ASC" ? "ASC" : "DESC";

        // Handle department sorting
        const sortColumn = sortField === "department" ? "d.name" : `u.${sortField}`;

        const whereClause = conditions.join(" AND ");

        // Main data query
        const dataQuery = `
          SELECT 
            u.id,
            u.name,
            u.username,
            u.email,
            u.phone,
            u.department_id,
            d.name AS department,
            r.name AS restaurant,
            u.enabled,
            IF(u.enabled = 1, "enabled", "disabled") AS status,
            u.last_login,
            u.created_at,
            u.updated_at
          FROM 
            users u
          LEFT JOIN departments d ON u.department_id = d.id
          LEFT JOIN restaurants r ON u.restaurant_id = r.id
          WHERE 
            ${whereClause}
          ORDER BY 
            ${sortColumn} ${sortDirection}
          LIMIT ? OFFSET ?
        `;

        // Count query for total records
        const countQuery = `
          SELECT COUNT(u.id) as total
          FROM 
            users u
          LEFT JOIN departments d ON u.department_id = d.id
          LEFT JOIN restaurants r ON u.restaurant_id = r.id
          WHERE 
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
                department_id,
                status,
                sort_by: sortField,
                sort_order: sortDirection,
            },
        };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const getUserById = async (id) => {
    try {
        const sql = `
          SELECT 
            u.id,
            u.name,
            u.username,
            u.email,
            u.phone,
            u.enabled,
            u.last_login,
            IF(u.enabled = 1, "enabled", "disabled") AS status,
            u.created_at,
            u.updated_at,
            u.department_id,
            JSON_OBJECT(
              'id', r.id,
              'name', r.name
            ) as restaurant,
            JSON_OBJECT(
              'id', d.id,
              'name', d.name
            ) as department
          FROM 
            users u
          LEFT JOIN 
            departments d ON u.department_id = d.id
          LEFT JOIN 
            restaurants r ON u.restaurant_id = r.id
          WHERE 
            u.id = ? AND u.deleted_at IS NULL
        `;

        const result = await executeQuery(sql, [id], "getUserById");
        return result?.[0] || null;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const getUserByEmailModel = async (email) => {
    try {
        const sql = `
            SELECT 
                u.id,
                u.name,
                u.username,
                u.email,
                u.enabled
            FROM 
                users u
            WHERE 
                u.email = ? AND u.deleted_at IS NULL
        `;
        const result = await executeQuery(sql, [email], "getUserByEmail");
        return result?.[0] || null;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const getUserByUsername = async (username) => {
    try {
        const sql = `
      SELECT 
        u.*,
        d.name as department_name
      FROM 
        users u
      LEFT JOIN 
        departments d ON u.department_id = d.id
      WHERE 
        u.username = ? AND u.deleted_at IS NULL
    `;

        const result = await executeQuery(sql, [username], "getUserByUsername");
        return result?.[0] || null;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const registerUser = async (obj) => {
    try {
        const { username, email, phone, password, name, department_id, restaurant_id, created_by } = obj;

        // Insert user with department_id instead of roles
        const userData = {
            username,
            email,
            phone,
            name,
            password: await hash(password),
            department_id,
            restaurant_id,
            created_by,
            created_at: new Date(),
        };

        const { sql, params } = buildInsertQuery("users", userData);
        const result = await executeQuery(sql, params, "registerUser");

        return { status: true, user_id: result.insertId };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const updateUser = async (obj) => {
    try {
        const { id, username, email, phone, name, department_id, restaurant_id, enabled, updated_by } = obj;
        
        const updateData = {
            username,
            email,
            phone,
            name,
            department_id,
            restaurant_id,
            enabled,
            updated_by,
            updated_at: new Date(),
        };

        const { sql, params } = buildUpdateQuery("users", updateData, { id });
        const result = await executeQuery(sql, params, "updateUser");

        if (result.affectedRows > 0) {
            const user = await getUserById(id);
            return { status: true, user };
        }
        
        return { status: false };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const deleteUser = async (obj) => {
    try {
        const { id, deleted_by } = obj;
        const sql = `
      UPDATE users 
      SET 
        deleted_at = NOW(),
        deleted_by = ?,
        updated_at = NOW(),
        updated_by = ?
      WHERE id = ?
    `;

        const result = await executeQuery(sql, [deleted_by, deleted_by, id], "deleteUser");
        return { status: result.affectedRows > 0 };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

// Password Management Functions
const updateUserPasswordModel = async (userId, newPassword, updatedBy) => {
    try {
        const hashedPassword = await hash(newPassword);
        const sql = `
            UPDATE users 
            SET password = ?, updated_at = NOW(), updated_by = ?
            WHERE id = ? AND deleted_at IS NULL
        `;
        const result = await executeQuery(sql, [hashedPassword, updatedBy, userId], "updateUserPassword");
        return result.affectedRows > 0;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const createPasswordResetTokenModel = async (userId, token, expiresAt) => {
    try {
        // First, delete any existing tokens for this user
        await executeQuery(
            "DELETE FROM password_reset_tokens WHERE user_id = ?", 
            [userId], 
            "deleteExistingResetTokens"
        );
        
        // Insert new token
        const sql = `
            INSERT INTO password_reset_tokens (user_id, token, expires_at, created_at)
            VALUES (?, ?, ?, NOW())
        `;
        const result = await executeQuery(sql, [userId, token, expiresAt], "createPasswordResetToken");
        return result.insertId;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const validatePasswordResetTokenModel = async (token) => {
    try {
        const sql = `
            SELECT user_id, expires_at 
            FROM password_reset_tokens 
            WHERE token = ? AND expires_at > NOW() AND used_at IS NULL
        `;
        const result = await executeQuery(sql, [token], "validatePasswordResetToken");
        return result[0] || null;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const resetPasswordModel = async (userId, newPassword) => {
    try {
        const hashedPassword = await hash(newPassword);
        
        // Update password
        const updateSql = `
            UPDATE users 
            SET password = ?, updated_at = NOW()
            WHERE id = ? AND deleted_at IS NULL
        `;
        await executeQuery(updateSql, [hashedPassword, userId], "resetPassword");
        
        // Mark token as used
        const markTokenSql = `
            UPDATE password_reset_tokens 
            SET used_at = NOW() 
            WHERE user_id = ? AND used_at IS NULL
        `;
        await executeQuery(markTokenSql, [userId], "markTokenUsed");
        
        return true;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

// Profile Management Functions
const updateUserProfileModel = async (userId, profileData, updatedBy) => {
    try {
        const updateData = {
            ...profileData,
            updated_at: new Date(),
            updated_by: updatedBy
        };
        
        const { sql, params } = buildUpdateQuery("users", updateData, { id: userId });
        const result = await executeQuery(sql, params, "updateUserProfile");
        
        if (result.affectedRows > 0) {
            const user = await getUserById(userId);
            return { status: true, user };
        }
        return { status: false };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const checkUserExistsExceptCurrent = async (email, phone, currentUserId) => {
    try {
        const sql = `
            SELECT id FROM users 
            WHERE (email = ? OR phone = ?) 
            AND id != ? 
            AND deleted_at IS NULL
        `;
        const result = await executeQuery(sql, [email, phone, currentUserId], "checkUserExistsExceptCurrent");
        return result.length > 0;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

// User Activity Functions
const createUserActivityLogModel = async (activityData) => {
    try {
        const logData = {
            user_id: activityData.user_id,
            action: activityData.action,
            description: activityData.description,
            ip_address: activityData.ip_address || null,
            target_user_id: activityData.target_user_id || null,
            created_at: new Date()
        };
        
        const { sql, params } = buildInsertQuery("user_activity_logs", logData);
        const result = await executeQuery(sql, params, "createUserActivityLog");
        return result.insertId;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const getUserActivityModel = async (userId, page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;
        
        const dataSql = `
            SELECT 
                id, action, description, ip_address, target_user_id, created_at
            FROM user_activity_logs 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;
        
        const countSql = `
            SELECT COUNT(*) as total 
            FROM user_activity_logs 
            WHERE user_id = ?
        `;
        
        const [activities, countResult] = await Promise.all([
            executeQuery(dataSql, [userId, limit, offset], "getUserActivity"),
            executeQuery(countSql, [userId], "getUserActivityCount")
        ]);
        
        const total = countResult[0]?.total || 0;
        
        return {
            data: activities,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(total / limit),
                total_records: total,
                limit: limit
            }
        };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

// User Status Management
const updateUserStatusModel = async (userId, status, updatedBy) => {
    try {
        const sql = `
            UPDATE users 
            SET enabled = ?, updated_at = NOW(), updated_by = ?
            WHERE id = ? AND deleted_at IS NULL
        `;
        const result = await executeQuery(sql, [status, updatedBy, userId], "updateUserStatus");
        return result.affectedRows > 0;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const updateLastLoginModel = async (userId) => {
    try {
        const sql = `
            UPDATE users 
            SET last_login = NOW() 
            WHERE id = ?
        `;
        await executeQuery(sql, [userId], "updateLastLogin");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

// Bulk Operations
const bulkDeleteUsersModel = async (userIds, deletedBy) => {
    try {
        const placeholders = userIds.map(() => '?').join(',');
        const sql = `
            UPDATE users 
            SET deleted_at = NOW(), deleted_by = ?, updated_at = NOW(), updated_by = ?
            WHERE id IN (${placeholders}) AND deleted_at IS NULL
        `;
        const params = [deletedBy, deletedBy, ...userIds];
        const result = await executeQuery(sql, params, "bulkDeleteUsers");
        
        return {
            status: true,
            deletedCount: result.affectedRows
        };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

// Export Functions
const exportUsersModel = async (format = 'csv') => {
    try {
        const sql = `
            SELECT 
                u.id,
                u.name,
                u.username,
                u.email,
                u.phone,
                d.name as department,
                r.name as restaurant,
                IF(u.enabled = 1, 'Active', 'Inactive') as status,
                u.last_login,
                u.created_at
            FROM users u
            LEFT JOIN departments d ON u.department_id = d.id
            LEFT JOIN restaurants r ON u.restaurant_id = r.id
            WHERE u.deleted_at IS NULL
            ORDER BY u.created_at DESC
        `;
        
        const users = await executeQuery(sql, [], "exportUsers");
        
        return {
            status: true,
            data: {
                users: users,
                format: format,
                exported_at: new Date()
            }
        };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

// Login Security Functions
const checkFailedLoginAttemptsModel = async (username) => {
    try {
        const sql = `
            SELECT failed_attempts, locked_until 
            FROM failed_login_attempts 
            WHERE username = ?
        `;
        const result = await executeQuery(sql, [username], "checkFailedLoginAttempts");
        return result[0] || null;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const incrementFailedLoginAttemptsModel = async (username) => {
    try {
        const sql = `
            INSERT INTO failed_login_attempts (username, failed_attempts, last_attempt, locked_until)
            VALUES (?, 1, NOW(), NULL)
            ON DUPLICATE KEY UPDATE
            failed_attempts = failed_attempts + 1,
            last_attempt = NOW(),
            locked_until = CASE 
                WHEN failed_attempts + 1 >= 5 THEN DATE_ADD(NOW(), INTERVAL 15 MINUTE)
                ELSE NULL 
            END
        `;
        await executeQuery(sql, [username], "incrementFailedLoginAttempts");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const resetFailedLoginAttemptsModel = async (username) => {
    try {
        const sql = `
            DELETE FROM failed_login_attempts WHERE username = ?
        `;
        await executeQuery(sql, [username], "resetFailedLoginAttempts");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const getUserLoginHistoryModel = async (userId, page = 1, limit = 10) => {
    try {
        const offset = (page - 1) * limit;
        
        const dataSql = `
            SELECT 
                action, description, ip_address, created_at
            FROM user_activity_logs 
            WHERE user_id = ? AND action IN ('login', 'logout', 'failed_login')
            ORDER BY created_at DESC 
            LIMIT ? OFFSET ?
        `;
        
        const countSql = `
            SELECT COUNT(*) as total 
            FROM user_activity_logs 
            WHERE user_id = ? AND action IN ('login', 'logout', 'failed_login')
        `;
        
        const [history, countResult] = await Promise.all([
            executeQuery(dataSql, [userId, limit, offset], "getUserLoginHistory"),
            executeQuery(countSql, [userId], "getUserLoginHistoryCount")
        ]);
        
        const total = countResult[0]?.total || 0;
        
        return {
            data: history,
            pagination: {
                current_page: page,
                total_pages: Math.ceil(total / limit),
                total_records: total,
                limit: limit
            }
        };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

module.exports = {
    // Basic CRUD
    getUserByIdModel: getUserById,
    getUserByUsernameModel: getUserByUsername,
    getUserByEmailModel,
    updateUserModel: updateUser,
    registerUserModel: registerUser,
    deleteUserModel: deleteUser,
    getUsersModel: getUsers,
    
    // Password Management
    updateUserPasswordModel,
    createPasswordResetTokenModel,
    validatePasswordResetTokenModel,
    resetPasswordModel,
    
    // Profile Management
    updateUserProfileModel,
    checkUserExistsExceptCurrent,
    
    // Activity & Status
    createUserActivityLogModel,
    getUserActivityModel,
    updateUserStatusModel,
    updateLastLoginModel,
    
    // Bulk Operations
    bulkDeleteUsersModel,
    
    // Export & Reports
    exportUsersModel,
    getUserLoginHistoryModel,
    
    // Security
    checkFailedLoginAttemptsModel,
    incrementFailedLoginAttemptsModel,
    resetFailedLoginAttemptsModel
};