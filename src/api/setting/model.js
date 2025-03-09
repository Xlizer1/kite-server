const { hash, executeQuery, buildInsertQuery, buildUpdateQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const getUserById = async (id) => {
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

module.exports = {
    getUserByIdModel: getUserById,
};
