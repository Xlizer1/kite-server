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

module.exports = {
    getTablesController,
    getTableByIdController,
    createTablesController,
    updateTablesController,
    deleteTablesController,
    regenerateTableQRCodeController,
    updateTableStatusController,
    getTableStatisticsController,
};
