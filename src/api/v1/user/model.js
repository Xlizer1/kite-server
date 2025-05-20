const { hash, executeQuery, buildInsertQuery, buildUpdateQuery } = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");

const getUsers = async () => {
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
            u.deleted_at IS NULL
          GROUP BY 
            u.id
        `;

        const result = await executeQuery(sql, "getUserById");
        return result || null;
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
