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
            role_id = "",
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

        // Role filter (users who have this specific role)
        if (role_id && role_id !== "") {
            conditions.push("EXISTS (SELECT 1 FROM permissions p2 WHERE p2.user_id = u.id AND p2.role_id = ?)");
            params.push(parseInt(role_id));
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
            d.id AS department_id,
            d.name AS department,
            u.enabled,
            IF(u.enabled = 1, "enabled", "disabled") AS status,
            u.created_at,
            u.updated_at,
            GROUP_CONCAT(p.role_id) as roles
          FROM 
            users u
          LEFT JOIN permissions p ON u.id = p.user_id
          LEFT JOIN departments d ON u.department_id = d.id
          WHERE 
            ${whereClause}
          GROUP BY 
            u.id
          ORDER BY 
            ${sortColumn} ${sortDirection}
          LIMIT ? OFFSET ?
        `;

        // Count query for total records
        const countQuery = `
          SELECT COUNT(DISTINCT u.id) as total
          FROM 
            users u
          LEFT JOIN departments d ON u.department_id = d.id
          ${role_id ? "LEFT JOIN permissions p2 ON u.id = p2.user_id" : ""}
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

        const processedUsers = processUserResults(result);
        const total = countResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limitNum);

        return {
            data: processedUsers || [],
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
                role_id,
                sort_by: sortField,
                sort_order: sortDirection,
            },
        };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

// Helper function to process user results (you might already have this)
const processUserResults = (results) => {
    return results.map((user) => ({
        ...user,
        roles: user.roles ? user.roles.split(",").map((role) => parseInt(role.trim())) : [],
    }));
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
            IF(u.enabled = 1, "enabled", "disabled") AS status,
            u.created_at,
            u.updated_at,
            JSON_OBJECT(
              'id', r.id,
              'name', r.name
            ) as restaurant,
            JSON_OBJECT(
              'id', d.id,
              'name', d.name
            ) as department,
            JSON_ARRAYAGG(p.role_id) as roles
          FROM 
            users u
          LEFT JOIN 
            permissions p ON u.id = p.user_id
          LEFT JOIN 
            departments d ON u.department_id = d.id
          LEFT JOIN 
            restaurants r ON u.restaurant_id = r.id
          WHERE 
            u.id = ? AND u.deleted_at IS NULL
          GROUP BY 
            u.id
        `;

        const result = await executeQuery(sql, [id], "getUserById");
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
        JSON_ARRAYAGG(p.role_id) as roles
      FROM 
        users u
      LEFT JOIN 
        permissions p ON u.id = p.user_id
      WHERE 
        u.username = ? AND u.deleted_at IS NULL
      GROUP BY 
        u.id
    `;

        const result = await executeQuery(sql, [username], "getUserById");
        return result?.[0] || null;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const registerUser = async (obj) => {
    try {
        const { username, email, phone, password, roles } = obj;

        // Insert user
        const userData = {
            username,
            email,
            phone,
            password: await hash(password),
            created_at: new Date(),
        };

        const { sql, params } = buildInsertQuery("users", userData);
        const result = await executeQuery(sql, params, "registerUser");

        if (result?.insertId && roles?.length) {
            // Insert roles
            const roleValues = roles.map((roleId) => [result.insertId, roleId]);
            await executeQuery(
                "INSERT INTO permissions (user_id, role_id) VALUES ?",
                [roleValues],
                "inserting user roles"
            );
        }

        return true;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const updateUser = async (obj) => {
    try {
        const { id, username, email, phone, password, roles } = obj;
        const updateData = {
            username,
            email,
            phone,
            ...(password && { password: await hash(password) }),
            updated_at: new Date(),
        };

        const { sql, params } = buildUpdateQuery("users", updateData, { id });
        const result = await executeQuery(sql, params, "updateUser");

        if (result.affectedRows > 0 && roles?.length) {
            // Delete existing roles
            await executeQuery("DELETE FROM permissions WHERE user_id = ?", [id], "deleting user roles");

            // Insert new roles
            const roleValues = roles.map((roleId) => [id, roleId]);
            await executeQuery(
                "INSERT INTO permissions (user_id, role_id) VALUES ?",
                [roleValues],
                "inserting user roles"
            );
        }

        const user = await getUserById(id);

        return { status: true, user };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const deleteUser = async (id, user_id) => {
    try {
        const sql = `
      UPDATE users 
      SET 
        deleted_at = NOW(),
        deleted_by = ?,
        updated_at = NOW(),
        updated_by = ?
      WHERE id = ?
    `;

        const result = await executeQuery(sql, [user_id, user_id, id], "deleteUser");
        return result.affectedRows > 0;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

module.exports = {
    getUserByIdModel: getUserById,
    getUserByUsernameModel: getUserByUsername,
    updateUserModel: updateUser,
    registerUserModel: registerUser,
    deleteUserModel: deleteUser,
    getUsersModel: getUsers,
};
