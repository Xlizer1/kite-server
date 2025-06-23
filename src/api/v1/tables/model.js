const { encryptObject, hash, executeQuery, buildInsertQuery, buildUpdateQuery } = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");
const QRCode = require("qrcode");

const { IP, PORT, BASE_URL } = process.env;

const ip = IP || "localhost";
const port = PORT || "8080";
const baseUrl = BASE_URL || `http://${ip}:${port}`;

const getTablesModel = async (request, user) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            restaurant_id = "",
            status = "", // 'available', 'occupied', 'reserved', 'maintenance'
            sort_by = "number",
            sort_order = "ASC",
        } = request.query || {};

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        const conditions = ["t.deleted_at IS NULL"];
        const params = [];

        // Add search condition
        if (search && search.trim()) {
            conditions.push(`(
                t.name LIKE ? OR 
                t.number LIKE ? OR
                CAST(t.number AS CHAR) LIKE ?
            )`);
            const searchParam = `%${search.trim()}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        // Add restaurant filter
        if (restaurant_id && restaurant_id !== "") {
            conditions.push("t.restaurant_id = ?");
            params.push(parseInt(restaurant_id));
        }

        // Add status filter
        if (status && status !== "") {
            conditions.push("t.status = ?");
            params.push(status);
        }

        // Restrict to user's restaurant for restaurant admins
        if (user.department_id === 2) {
            // RESTAURANT_ADMIN
            conditions.push("t.restaurant_id = ?");
            params.push(user.restaurant_id);
        }

        const allowedSortFields = ["id", "number", "name", "seats", "status", "created_at", "updated_at"];
        const sortField = allowedSortFields.includes(sort_by) ? sort_by : "number";
        const sortDirection = sort_order.toUpperCase() === "DESC" ? "DESC" : "ASC";

        const whereClause = conditions.join(" AND ");

        const dataQuery = `
            SELECT 
                t.id,
                t.restaurant_id,
                t.number,
                t.name,
                t.seats,
                t.status,
                t.customer_count,
                t.created_at,
                t.updated_at,
                r.name AS restaurant_name,
                qr.qr_code,
                CASE 
                    WHEN t.status = 'available' THEN 'Available'
                    WHEN t.status = 'occupied' THEN 'Occupied'
                    WHEN t.status = 'reserved' THEN 'Reserved'
                    WHEN t.status = 'maintenance' THEN 'Under Maintenance'
                    ELSE 'Unknown'
                END AS status_display
            FROM 
                tables t
            LEFT JOIN restaurants r ON t.restaurant_id = r.id
            LEFT JOIN qr_codes qr ON t.id = qr.table_id
            WHERE 
                ${whereClause}
            ORDER BY 
                t.${sortField} ${sortDirection}
            LIMIT ? OFFSET ?
        `;

        const countQuery = `
            SELECT COUNT(t.id) as total
            FROM 
                tables t
            LEFT JOIN restaurants r ON t.restaurant_id = r.id
            WHERE 
                ${whereClause}
        `;

        const dataParams = [...params, limitNum, offset];
        const countParams = [...params];

        const [result, countResult] = await Promise.all([
            executeQuery(dataQuery, dataParams, "getTables"),
            executeQuery(countQuery, countParams, "getTablesCount"),
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
                restaurant_id,
                status,
                sort_by: sortField,
                sort_order: sortDirection,
            },
        };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const getTableByIdModel = async (id, user) => {
    try {
        let sql = `
            SELECT 
                t.id,
                t.restaurant_id,
                t.number,
                t.name,
                t.seats,
                t.status,
                t.customer_count,
                t.created_at,
                t.updated_at,
                JSON_OBJECT(
                    'id', r.id,
                    'name', r.name
                ) as restaurant,
                qr.qr_code,
                qr.created_at as qr_created_at
            FROM 
                tables t
            LEFT JOIN 
                restaurants r ON t.restaurant_id = r.id
            LEFT JOIN 
                qr_codes qr ON t.id = qr.table_id
            WHERE 
                t.id = ? 
            AND 
                t.deleted_at IS NULL
        `;

        // Restrict to user's restaurant for restaurant admins
        if (user?.department_id === 2 && user?.restaurant_id) {
            sql += ` AND t.restaurant_id = ${user?.restaurant_id}`;
        }

        const result = await executeQuery(sql, [id], "getTableById");
        return result?.[0] || null;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const createTablesModel = async (obj) => {
    try {
        const { restaurant_id, number, name, seats, creator_id } = obj;

        // Check if table number already exists for this restaurant
        const checkSql = `
            SELECT id FROM tables 
            WHERE restaurant_id = ? AND number = ? AND deleted_at IS NULL
        `;
        const existingTable = await executeQuery(checkSql, [restaurant_id, number], "checkExistingTable");

        if (existingTable.length > 0) {
            return {
                status: false,
                message: "A table with the same number already exists for this restaurant.",
            };
        }

        // Encrypt data for QR code
        const hash = encryptObject({ restaurant_id, number });
        const qrData = `${hash.iv}:${hash.encryptedData}`;
        const qrCode = await QRCode.toDataURL(`${baseUrl}/menu&key=${qrData}`);

        // Use transaction for table and QR code creation
        const tableData = {
            restaurant_id,
            number,
            name: name || `Table ${number}`,
            seats: seats || 4,
            status: "available",
            customer_count: 0,
            created_at: new Date(),
            created_by: creator_id,
        };

        const { sql: tableSql, params: tableParams } = buildInsertQuery("tables", tableData);
        const tableResult = await executeQuery(tableSql, tableParams, "createTable");

        if (tableResult?.insertId) {
            const tableId = tableResult.insertId;

            // Insert QR Code
            const qrData = {
                table_id: tableId,
                qr_code: qrCode,
                created_at: new Date(),
                created_by: creator_id,
            };

            const { sql: qrSql, params: qrParams } = buildInsertQuery("qr_codes", qrData);
            const qrResult = await executeQuery(qrSql, qrParams, "insertQRCode");

            if (!qrResult?.insertId) {
                // Rollback table creation
                await executeQuery("DELETE FROM tables WHERE id = ?", [tableId], "rollbackTable");
                return {
                    status: false,
                    message: "Failed to create QR code; rolled back table creation.",
                };
            }

            return {
                status: true,
                message: "Table and QR code created successfully.",
                table_id: tableId,
                qr_code: qrCode,
            };
        } else {
            throw new CustomError("Failed to create table.", 500);
        }
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const updateTablesModel = async (obj) => {
    try {
        const { id, name, number, seats, status, updater_id } = obj;

        const updateData = {
            name,
            number,
            seats,
            status,
            updated_at: new Date(),
            updated_by: updater_id,
        };

        // Remove undefined values
        Object.keys(updateData).forEach((key) => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        const { sql, params } = buildUpdateQuery("tables", updateData, { id });
        const result = await executeQuery(sql, params, "updateTable");

        if (result.affectedRows > 0) {
            const table = await getTableByIdModel(id, { department_id: 1 }); // Admin access for update
            return { status: true, table };
        }

        return { status: false };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const deleteTablesModel = async (id, user_id) => {
    try {
        const updateData = {
            deleted_at: new Date(),
            deleted_by: user_id,
            updated_at: new Date(),
            updated_by: user_id,
        };

        const { sql, params } = buildUpdateQuery("tables", updateData, { id });
        const result = await executeQuery(sql, params, "deleteTable");

        return { status: result.affectedRows > 0 };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const regenerateTableQRCodeModel = async (tableId, userId) => {
    try {
        // Get table details
        const tableSql = `
            SELECT restaurant_id, number, name
            FROM tables
            WHERE id = ? AND deleted_at IS NULL
        `;
        const tableResult = await executeQuery(tableSql, [tableId], "getTableForQRRegen");

        if (!tableResult || tableResult.length === 0) {
            throw new CustomError("Table not found", 404);
        }

        const { restaurant_id, number, name } = tableResult[0];

        // Encrypt the data
        const hash = encryptObject({ restaurant_id, number });
        const qrData = `${hash.iv}:${hash.encryptedData}`;
        const qrCode = await QRCode.toDataURL(`${baseUrl}/menu&key=${qrData}`);

        // Check if QR code exists for this table
        const checkQRSql = `SELECT id FROM qr_codes WHERE table_id = ?`;
        const existingQR = await executeQuery(checkQRSql, [tableId], "checkExistingQR");

        if (existingQR && existingQR.length > 0) {
            // Update existing QR code
            const updateData = {
                qr_code: qrCode,
                updated_at: new Date(),
                updated_by: userId,
            };

            const { sql, params } = buildUpdateQuery("qr_codes", updateData, { table_id: tableId });
            await executeQuery(sql, params, "updateQRCode");
        } else {
            // Insert new QR code
            const qrData = {
                table_id: tableId,
                qr_code: qrCode,
                created_at: new Date(),
                created_by: userId,
            };

            const { sql, params } = buildInsertQuery("qr_codes", qrData);
            await executeQuery(sql, params, "insertQRCode");
        }

        return {
            status: true,
            table_id: tableId,
            table_number: number,
            table_name: name,
            restaurant_id,
            qr_code: qrCode,
        };
    } catch (error) {
        throw error instanceof CustomError ? error : new CustomError(error.message, 500);
    }
};

const updateTableStatusModel = async (tableId, statusData, userId) => {
    try {
        const { status, customer_count } = statusData;

        const updateData = {
            status,
            customer_count,
            updated_at: new Date(),
            updated_by: userId,
        };

        // Remove undefined values
        Object.keys(updateData).forEach((key) => {
            if (updateData[key] === undefined) {
                delete updateData[key];
            }
        });

        const { sql, params } = buildUpdateQuery("tables", updateData, { id: tableId });
        const result = await executeQuery(sql, params, "updateTableStatus");

        if (result.affectedRows > 0) {
            const table = await getTableByIdModel(tableId, { department_id: 1 }); // Admin access
            return { status: true, table };
        }

        return { status: false };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const getTableStatisticsModel = async (restaurantId) => {
    try {
        const sql = `
            SELECT 
                COUNT(*) as total_tables,
                COUNT(CASE WHEN status = 'available' THEN 1 END) as available_tables,
                COUNT(CASE WHEN status = 'occupied' THEN 1 END) as occupied_tables,
                COUNT(CASE WHEN status = 'reserved' THEN 1 END) as reserved_tables,
                COUNT(CASE WHEN status = 'maintenance' THEN 1 END) as maintenance_tables,
                SUM(CASE WHEN status = 'occupied' THEN customer_count ELSE 0 END) as total_customers,
                AVG(CASE WHEN status = 'occupied' THEN customer_count ELSE 0 END) as avg_customers_per_table
            FROM tables 
            WHERE deleted_at IS NULL
            ${restaurantId ? "AND restaurant_id = ?" : ""}
        `;

        const params = restaurantId ? [restaurantId] : [];
        const result = await executeQuery(sql, params, "getTableStatistics");

        return result[0] || null;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

// Activity logging helper
const createUserActivityLogModel = async (activityData) => {
    try {
        const logData = {
            user_id: activityData.user_id,
            action: activityData.action,
            description: activityData.description,
            metadata: activityData.metadata || null,
            created_at: new Date(),
        };

        const { sql, params } = buildInsertQuery("user_activity_logs", logData);
        const result = await executeQuery(sql, params, "createUserActivityLog");
        return result.insertId;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

module.exports = {
    getTablesModel,
    getTableByIdModel,
    createTablesModel,
    updateTablesModel,
    deleteTablesModel,
    regenerateTableQRCodeModel,
    updateTableStatusModel,
    getTableStatisticsModel,
    createUserActivityLogModel,
};
