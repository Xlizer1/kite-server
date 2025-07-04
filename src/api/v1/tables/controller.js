const {
    getTablesModel,
    createTablesModel,
    updateTablesModel,
    deleteTablesModel,
    regenerateTableQRCodeModel,
    getTableByIdModel,
    updateTableStatusModel,
    getTableStatisticsModel,
    createUserActivityLogModel,
} = require("./model");

const { resultObject, verifyUserToken, getToken } = require("../../../helpers/common");
const { hasPermission, isAdmin, isManagement, DEPARTMENTS } = require("../../../helpers/permissions");
const { ValidationError, CustomError } = require("../../../middleware/errorHandler");

const getTablesController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user can read tables
        if (!hasPermission(authorize.department_id, "tables", "read")) {
            return callBack(resultObject(false, "You don't have permission to view tables!"));
        }

        const result = await getTablesModel(request, authorize);

        if (result && result.data && Array.isArray(result.data)) {
            callBack(resultObject(true, "Tables retrieved successfully", result));
        } else if (result && result.data && result.data.length === 0) {
            callBack(
                resultObject(true, "No tables found", {
                    data: [],
                    pagination: result.pagination,
                    filters: result.filters,
                })
            );
        } else {
            callBack(resultObject(false, "Failed to retrieve tables"));
        }
    } catch (error) {
        console.error("Error in getTablesController:", error);
        if (error instanceof ValidationError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

const getTableByIdController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user can read tables
        if (!hasPermission(authorize.department_id, "tables", "read")) {
            return callBack(resultObject(false, "You don't have permission to view this table!"));
        }

        const { id } = request.params;
        if (!id || isNaN(id)) {
            throw new ValidationError("Invalid table ID provided.");
        }

        const table = await getTableByIdModel(id, authorize);

        if (table && table?.id) {
            callBack(resultObject(true, "Table retrieved successfully", table));
        } else {
            throw new ValidationError("Table doesn't exist.");
        }
    } catch (error) {
        console.error("Error in getTableByIdController:", error);
        if (error instanceof ValidationError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

const createTablesController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user can create tables
        if (!hasPermission(authorize.department_id, "tables", "create")) {
            return callBack(resultObject(false, "You don't have permission to create tables!"));
        }

        const { restaurant_id, number, name, seats } = request?.body;

        // Validate restaurant access for non-admin users
        if (authorize.department_id === DEPARTMENTS.RESTAURANT_ADMIN && authorize.restaurant_id !== restaurant_id) {
            return callBack(resultObject(false, "You can only create tables for your restaurant!"));
        }

        const result = await createTablesModel({
            restaurant_id: restaurant_id || authorize.restaurant_id,
            number,
            name,
            seats,
            creator_id: authorize.id,
        });

        if (result?.status) {
            // Log table creation
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "table_created",
                description: `Created new table: ${number}`,
                metadata: JSON.stringify({ restaurant_id, number, name, seats }),
            });

            return callBack(resultObject(true, "Table created successfully.", result));
        } else if (result?.message) {
            return callBack(resultObject(false, result.message));
        } else {
            return callBack(resultObject(false, "Failed to create table. Please try again."));
        }
    } catch (error) {
        console.error("Error in createTablesController:", error);
        if (error instanceof ValidationError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

const updateTablesController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user can update tables
        if (!hasPermission(authorize.department_id, "tables", "update")) {
            return callBack(resultObject(false, "You don't have permission to update tables!"));
        }

        const { id } = request?.params;
        const { name, number, seats, status } = request?.body;

        // Get existing table to verify ownership for restaurant admins
        if (authorize.department_id === DEPARTMENTS.RESTAURANT_ADMIN) {
            const existingTable = await getTableByIdModel(id, authorize);
            if (!existingTable || existingTable.restaurant_id !== authorize.restaurant_id) {
                return callBack(resultObject(false, "You can only update tables in your restaurant!"));
            }
        }

        const result = await updateTablesModel({
            id,
            name,
            number,
            seats,
            status,
            updater_id: authorize?.id,
        });

        if (result?.status) {
            // Log table update
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "table_updated",
                description: `Updated table ID: ${id}`,
                metadata: JSON.stringify({ name, number, seats, status }),
            });

            callBack(resultObject(true, "Table updated successfully.", result.table));
        } else {
            callBack(resultObject(false, "Failed to update table."));
        }
    } catch (error) {
        console.error("Error in updateTablesController:", error);
        if (error instanceof ValidationError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

const deleteTablesController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user can delete tables
        if (!hasPermission(authorize.department_id, "tables", "delete")) {
            return callBack(resultObject(false, "You don't have permission to delete tables!"));
        }

        const { id } = request?.params;

        // Get existing table to verify ownership for restaurant admins
        if (authorize.department_id === DEPARTMENTS.RESTAURANT_ADMIN) {
            const existingTable = await getTableByIdModel(id, authorize);
            if (!existingTable || existingTable.restaurant_id !== authorize.restaurant_id) {
                return callBack(resultObject(false, "You can only delete tables in your restaurant!"));
            }
        }

        const result = await deleteTablesModel(id, authorize?.id);

        if (result?.status) {
            // Log table deletion
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "table_deleted",
                description: `Deleted table ID: ${id}`,
            });

            callBack(resultObject(true, "Table deleted successfully."));
        } else {
            callBack(resultObject(false, "Failed to delete table."));
        }
    } catch (error) {
        console.error("Error in deleteTablesController:", error);
        if (error instanceof ValidationError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

const regenerateTableQRCodeController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user can update tables (QR regeneration is an update operation)
        if (!hasPermission(authorize.department_id, "tables", "update")) {
            return callBack(resultObject(false, "You don't have permission to regenerate QR codes!"));
        }

        const { id } = request.params;

        if (!id || isNaN(id)) {
            return callBack(resultObject(false, "Valid table ID is required"));
        }

        // Get existing table to verify ownership for restaurant admins
        if (authorize.department_id === DEPARTMENTS.RESTAURANT_ADMIN) {
            const existingTable = await getTableByIdModel(id, authorize);
            if (!existingTable || existingTable.restaurant_id !== authorize.restaurant_id) {
                return callBack(resultObject(false, "You can only regenerate QR codes for tables in your restaurant!"));
            }
        }

        const result = await regenerateTableQRCodeModel(id, authorize.id);

        if (result && result.status) {
            // Log QR code regeneration
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "table_qr_regenerated",
                description: `Regenerated QR code for table ID: ${id}`,
            });

            callBack(
                resultObject(true, "QR code regenerated successfully", {
                    table_id: result.table_id,
                    table_number: result.table_number,
                    qr_code: result.qr_code,
                })
            );
        } else {
            callBack(resultObject(false, "Failed to regenerate QR code"));
        }
    } catch (error) {
        console.error("Error in regenerateTableQRCode:", error);

        if (error instanceof CustomError) {
            callBack(resultObject(false, error.message, null, error.statusCode));
            return;
        }

        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

const updateTableStatusController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user can update tables (captains and above can update status)
        if (!hasPermission(authorize.department_id, "tables", "update")) {
            return callBack(resultObject(false, "You don't have permission to update table status!"));
        }

        const { id } = request.params;
        const { status, customer_count } = request.body;

        const result = await updateTableStatusModel(id, { status, customer_count }, authorize.id);

        if (result?.status) {
            // Log table status update
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "table_status_updated",
                description: `Updated table ${id} status to: ${status}`,
                metadata: JSON.stringify({ status, customer_count }),
            });

            callBack(resultObject(true, "Table status updated successfully", result.table));
        } else {
            callBack(resultObject(false, "Failed to update table status"));
        }
    } catch (error) {
        console.error("Error in updateTableStatusController:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

const getTableStatisticsController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user can read tables
        if (!hasPermission(authorize.department_id, "tables", "read")) {
            return callBack(resultObject(false, "You don't have permission to view table statistics!"));
        }

        const restaurant_id =
            authorize.department_id === DEPARTMENTS.RESTAURANT_ADMIN
                ? authorize.restaurant_id
                : request.query.restaurant_id;

        const result = await getTableStatisticsModel(restaurant_id);

        if (result) {
            callBack(resultObject(true, "Table statistics retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve table statistics"));
        }
    } catch (error) {
        console.error("Error in getTableStatisticsController:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

/**
 * Manual table reset for staff (for edge cases like walkouts)
 */
const manualTableResetController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user can manage tables
        if (!hasPermission(authorize.department_id, "tables", "update")) {
            return callBack(resultObject(false, "You don't have permission to reset tables!"));
        }

        const { id } = request.params;
        const { reason } = request.body; // Why staff is manually resetting

        // Get current table info
        const tableQuery = `
            SELECT t.id, t.number, t.restaurant_id, t.status
            FROM tables t
            WHERE t.id = ? AND t.deleted_at IS NULL
        `;
        const tableResult = await executeQuery(tableQuery, [id], "getTableForReset");

        if (!tableResult || tableResult.length === 0) {
            return callBack(resultObject(false, "Table not found"));
        }

        const table = tableResult[0];

        // ✅ IMPROVED: Get all sessions for this table (in case of multiple sessions)
        const getActiveSessionsQuery = `
            SELECT c.id, c.session_id 
            FROM carts c 
            WHERE c.table_id = ? AND c.restaurant_id = ?
        `;
        const activeSessions = await executeQuery(
            getActiveSessionsQuery,
            [table.id, table.restaurant_id],
            "getActiveSessions"
        );

        // Clear ALL sessions for this table (not just one)
        if (activeSessions && activeSessions.length > 0) {
            for (const session of activeSessions) {
                // Clear cart items for each session
                await executeQuery(`DELETE FROM cart_items WHERE cart_id = ?`, [session.id], "clearCartItemsManual");

                console.log(`🧹 Cleared cart items for session: ${session.session_id}`);
            }

            // Clear all carts for this table
            await executeQuery(
                `DELETE FROM carts WHERE table_id = ? AND restaurant_id = ?`,
                [table.id, table.restaurant_id],
                "clearCartsManual"
            );

            console.log(`🧹 Cleared ${activeSessions.length} sessions for Table ${table.number}`);
        }

        // Reset table status
        const resetQuery = `
            UPDATE tables 
            SET status = 'available', 
                customer_count = 0, 
                updated_at = CURRENT_TIMESTAMP,
                updated_by = ?
            WHERE id = ?
        `;
        await executeQuery(resetQuery, [authorize.id, table.id], "manualTableReset");

        // Log the manual reset
        await createUserActivityLogModel({
            user_id: authorize.id,
            action: "table_manual_reset",
            description: `Manually reset Table ${table.number}${reason ? `: ${reason}` : ""}`,
            metadata: JSON.stringify({
                table_id: table.id,
                previous_status: table.status,
                sessions_cleared: activeSessions?.length || 0,
                reason: reason || "No reason provided",
            }),
        });

        callBack(
            resultObject(
                true,
                `Table ${table.number} has been reset successfully. ${activeSessions?.length || 0} sessions cleared.`
            )
        );
    } catch (error) {
        console.error("Error in manualTableResetController:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

const getTableSessionStatusController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        if (!hasPermission(authorize.department_id, "tables", "read")) {
            return callBack(resultObject(false, "You don't have permission to view table sessions!"));
        }

        const { id } = request.params;

        // Get table with session information
        const tableSessionQuery = `
            SELECT 
                t.id,
                t.number,
                t.name,
                t.status,
                t.customer_count,
                t.updated_at as table_updated,
                COUNT(c.id) as active_sessions,
                GROUP_CONCAT(c.session_id) as session_ids,
                MAX(c.updated_at) as last_activity,
                SUM(COALESCE(cart_totals.item_count, 0)) as total_items,
                SUM(COALESCE(cart_totals.total_amount, 0)) as total_amount
            FROM tables t
            LEFT JOIN carts c ON t.id = c.table_id
            LEFT JOIN (
                SELECT 
                    ci.cart_id,
                    COUNT(ci.id) as item_count,
                    SUM(i.price * ci.quantity) as total_amount
                FROM cart_items ci
                JOIN items i ON ci.item_id = i.id
                GROUP BY ci.cart_id
            ) cart_totals ON c.id = cart_totals.cart_id
            WHERE t.id = ? AND t.deleted_at IS NULL
            GROUP BY t.id
        `;

        const result = await executeQuery(tableSessionQuery, [id], "getTableSessionStatus");

        if (!result || result.length === 0) {
            return callBack(resultObject(false, "Table not found"));
        }

        const tableData = result[0];

        // Parse session IDs if they exist
        if (tableData.session_ids) {
            tableData.session_list = tableData.session_ids.split(",");
        } else {
            tableData.session_list = [];
        }
        delete tableData.session_ids;

        callBack(resultObject(true, "Table session status retrieved successfully", tableData));
    } catch (error) {
        console.error("Error in getTableSessionStatusController:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

module.exports = {
    getTablesController,
    getTableByIdController,
    createTablesController,
    updateTablesController,
    deleteTablesController,
    regenerateTableQRCodeController,
    updateTableStatusController,
    getTableStatisticsController,
    manualTableResetController,
    getTableSessionStatusController,
};
