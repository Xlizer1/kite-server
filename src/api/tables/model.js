const fs = require("fs");
const qr = require("qrcode");
const { executeQuery, executeTransaction, buildInsertQuery, buildUpdateQuery } = require("../../helpers/db");
const { CustomError } = require("../../middleware/errorHandler");

const getTables = async (restaurant_id = 1) => {
    console.log(restaurant_id)
    try {
        const sql = `
            SELECT
                t.id,
                t.restaurant_id,
                t.created_at,
                t.updated_at
            FROM
                tables t
            WHERE
                t.restaurant_id = ?
            AND
                t.deleted_at IS NULL
        `;

        return await executeQuery(sql, [1], "getTables");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const createTables = async (tableData) => {
    try {
        const { restaurant_id, name, seats, creator_id } = tableData;

        // Check if table name already exists for this restaurant
        const checkSql = `
            SELECT id FROM tables 
            WHERE restaurant_id = ? 
            AND name = ? 
            AND deleted_at IS NULL
        `;
        const existingTable = await executeQuery(checkSql, [restaurant_id, name], "checkExistingTable");
        
        if (existingTable.length > 0) {
            throw new CustomError("Table name already exists for this restaurant", 400);
        }

        // Start transaction for table and QR code creation
        const queries = [];

        // Add table insert query
        const tableQuery = buildInsertQuery('tables', {
            restaurant_id,
            name,
            seats,
            created_at: new Date(),
            created_by: creator_id
        });
        queries.push(tableQuery);

        // Generate QR code
        const qrData = {
            restaurant_id,
            table_name: name,
            created_at: new Date()
        };

        const qrPath = `uploads/qrcodes/table_${Date.now()}.png`;
        await qr.toFile(qrPath, JSON.stringify(qrData));

        // Add QR code update query
        queries.push({
            sql: 'UPDATE tables SET qr_code = ? WHERE id = LAST_INSERT_ID()',
            params: [qrPath]
        });

        // Execute transaction
        await executeTransaction(queries, 'createTables');
        return true;

    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const updateTables = async (obj) => {
    try {
        const { id, name, seats, updater_id } = obj;

        const { sql, params } = buildUpdateQuery('tables', 
            {
                name,
                seats,
                updated_at: new Date(),
                updated_by: updater_id
            },
            { id }
        );

        const result = await executeQuery(sql, params, "updateTables");
        return result.affectedRows > 0;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const deleteTables = async (id, user_id) => {
    try {
        const { sql, params } = buildUpdateQuery('tables',
            {
                deleted_at: new Date(),
                deleted_by: user_id,
                updated_at: new Date(),
                updated_by: user_id
            },
            { id }
        );

        const result = await executeQuery(sql, params, "deleteTables");
        return result.affectedRows > 0;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

module.exports = {
    getTablesModel: getTables,
    createTablesModel: createTables,
    updateTablesModel: updateTables,
    deleteTablesModel: deleteTables,
};
