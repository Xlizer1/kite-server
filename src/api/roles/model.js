const { executeQuery, executeTransaction, buildInsertQuery, buildUpdateQuery } = require("../../helpers/db");
const { CustomError } = require("../../middleware/errorHandler");

const getRoles = async () => {
    try {
        const sql = `
            SELECT
                r.id,
                r.name,
                r.created_at,
                r.updated_at
            FROM
                roles r
            WHERE
                r.deleted_at IS NULL
        `;

        return await executeQuery(sql, [], "getRoles");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const getRolesByID = async (id) => {
    try {
        const sql = `
            SELECT
                r.id,
                r.name,
                r.created_at,
                r.updated_at
            FROM
                roles r
            WHERE
                r.id = ?
            AND
                r.deleted_at IS NULL
        `;

        const result = await executeQuery(sql, [id], "getRolesByID");
        return result[0];
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const updateRoles = async (obj) => {
    try {
        const { id, name, updater_id } = obj;

        const { sql, params } = buildUpdateQuery('roles', 
            {
                name,
                updated_at: new Date(),
                updated_by: updater_id
            },
            { id }
        );

        const result = await executeQuery(sql, params, "updateRoles");
        return result.affectedRows > 0;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const updateUserRoles = async (id, roles, updater_id) => {
    try {
        // Start transaction for deleting old roles and inserting new ones
        const queries = [];

        // Delete existing roles
        queries.push({
            sql: 'DELETE FROM permissions WHERE user_id = ?',
            params: [id]
        });

        // Insert new roles
        for (const role_id of roles) {
            const roleQuery = buildInsertQuery('permissions', {
                user_id: id,
                role_id,
                created_at: new Date(),
                created_by: updater_id
            });
            queries.push(roleQuery);
        }

        // Execute transaction
        await executeTransaction(queries, 'updateUserRoles');
        return true;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const deleteRoles = async (id, user_id) => {
    try {
        const { sql, params } = buildUpdateQuery('roles',
            {
                deleted_at: new Date(),
                deleted_by: user_id,
                updated_at: new Date(),
                updated_by: user_id
            },
            { id }
        );

        const result = await executeQuery(sql, params, "deleteRoles");
        return result.affectedRows > 0;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

module.exports = {
    getRolesModel: getRoles,
    getRolesByIDModel: getRolesByID,
    updateRolesModel: updateRoles,
    updateUserRolesModel: updateUserRoles,
    deleteRolesModel: deleteRoles,
};
