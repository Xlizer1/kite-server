const { executeQuery } = require("../../../helpers/db");
const { CustomError } = require("../../../middleware/errorHandler");

const getRestaurantTablesModel = async (req) => {
    try {
        const sql = `
            SELECT
                t.id,
                t.number,
                ts.name
            FROM
                tables t
            LEFT JOIN
                table_statuses as ts on ts.id = t.status
        `;

        return await executeQuery(sql, [], "getRestaurantTablesModel");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

module.exports = {
    getRestaurantTablesModel,
};
