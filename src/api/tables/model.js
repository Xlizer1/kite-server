const { encryptObject } = require("../../helpers/common");
const { executeQuery, buildUpdateQuery } = require("../../helpers/db");
const { CustomError } = require("../../middleware/errorHandler");
const QRCode = require("qrcode");

const { IP, PORT, BASE_URL } = process.env;

const ip = IP || "localhost";
const port = PORT || "8000";

const baseUrl = BASE_URL || `http://${ip}:${port}`;

const getTables = async (restaurant_id = 1) => {
    console.log(restaurant_id);
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

const createTables = async (obj) => {
    return new Promise(async (resolve, reject) => {
        const { restaurant_id, number, creator_id } = obj;

        try {
            // Check if the table exists
            let checkSql = `
                SELECT
                    id
                FROM
                    tables
                WHERE
                    restaurant_id = ${restaurant_id} AND number = ${number}
            `;
            const existingTable = await executeQuery(checkSql, "checkExistingTable");

            if (existingTable.length > 0) {
                return resolve({
                    status: false,
                    message: "A table with the same number already exists for this restaurant.",
                });
            }
            // Encrypt the data
            const hash = encryptObject({ restaurant_id, number });

            // Convert the hash object to a URL-compatible format
            const qrData = `${hash.iv}:${hash.encryptedData}`;

            // Generate QR code
            const qrCode = await QRCode.toDataURL(`${baseUrl}/menu&key=${qrData}`);

            // Insert table
            let tableSql = `
                INSERT INTO
                    tables
                SET
                    restaurant_id = ${restaurant_id},
                    number = ${number},
                    created_at = NOW(),
                    created_by = ${creator_id}
            `;
            const tableResult = await executeQuery(tableSql, "createTables");

            if (tableResult?.insertId) {
                const tableId = tableResult.insertId;

                // Insert QR Code into the database
                let qrSql = `
                INSERT INTO
                    qr_codes
                SET
                    table_id = ${tableId},
                    qr_code = "${qrCode}",
                    created_at = NOW(),
                    created_by = ${creator_id}
                `;
                const qrResult = await executeQuery(qrSql, "insertQRCode");

                if (!qrResult?.insertId) {
                    let deleteSql = `
                        DELETE FROM
                            tables
                        WHERE
                            id = ${tableId}
                    `;
                    await executeQuery(deleteSql, "rollbackTable");
                    return resolve({
                        status: false,
                        message: "Failed to insert QR code; rolled back table creation.",
                    });
                } else {
                    return resolve({
                        status: true,
                        message: "Table and QR code created successfully.",
                    });
                }
            } else {
                return reject(new CustomError("An unknown error occurred during table creation.", 500));
            }
        } catch (error) {
            console.error("Error during table creation:", error);
            reject(new Error("Failed to create table and QR code."));
        }
    });
};

const updateTables = async (obj) => {
    try {
        const { id, name, seats, updater_id } = obj;

        const { sql, params } = buildUpdateQuery(
            "tables",
            {
                name,
                seats,
                updated_at: new Date(),
                updated_by: updater_id,
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
        const { sql, params } = buildUpdateQuery(
            "tables",
            {
                deleted_at: new Date(),
                deleted_by: user_id,
                updated_at: new Date(),
                updated_by: user_id,
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
