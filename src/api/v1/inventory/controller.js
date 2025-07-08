const {
    getInventoryItemsModel,
    getInventoryItemsByRestaurantIDModel,
    getLowStockItemsModel,
    createInventoryItemModel,
    updateInventoryItemModel,
    deleteInventoryItemModel,
    getInventoryHistoryModel,
} = require("./model");
const { resultObject, verifyUserToken, getToken } = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");

const getInventoryItems = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1)) {
            throw new CustomError("You don't have permission to view inventory items!", 403);
        }

        const result = await getInventoryItemsModel();
        callBack(resultObject(true, "Inventory items retrieved successfully", result));
    } catch (error) {
        console.error("Error in getInventoryItems:", error);
        callBack(
            resultObject(
                false,
                error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
                null,
                error instanceof CustomError ? error.statusCode : 500
            )
        );
    }
};

const getInventoryItemsByRestaurantID = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1)) {
            throw new CustomError("You don't have permission to view inventory items!", 403);
        }

        const { restaurant_id } = request.params;
        if (!restaurant_id) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        const result = await getInventoryItemsByRestaurantIDModel(restaurant_id);
        callBack(resultObject(true, "Inventory items retrieved successfully", result));
    } catch (error) {
        console.error("Error in getInventoryItemsByRestaurantID:", error);
        callBack(
            resultObject(
                false,
                error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
                null,
                error instanceof CustomError ? error.statusCode : 500
            )
        );
    }
};

const getLowStockItems = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1)) {
            throw new CustomError("You don't have permission to view inventory items!", 403);
        }

        const { restaurant_id } = request.params;
        if (!restaurant_id) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        const result = await getLowStockItemsModel(restaurant_id);
        callBack(resultObject(true, "Low stock items retrieved successfully", result));
    } catch (error) {
        console.error("Error in getLowStockItems:", error);
        callBack(
            resultObject(
                false,
                error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
                null,
                error instanceof CustomError ? error.statusCode : 500
            )
        );
    }
};

const createInventoryItem = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.roles?.includes(1)) {
            throw new CustomError("You don't have permission to create inventory items!", 403);
        }

        const { restaurant_id, name, quantity, unit_id, threshold, price, currency_id } = request.body;

        // Validate required fields
        if (!restaurant_id || !name || !quantity || !unit_id || !price || !currency_id) {
            throw new CustomError("Missing required fields", 400);
        }

        // Validate numeric fields
        if (isNaN(quantity) || quantity < 0) {
            throw new CustomError("Quantity must be a non-negative number", 400);
        }

        if (isNaN(price) || price < 0) {
            throw new CustomError("Price must be a non-negative number", 400);
        }

        if (threshold && (isNaN(threshold) || threshold < 0)) {
            throw new CustomError("Threshold must be a non-negative number", 400);
        }

        const itemData = {
            restaurant_id,
            name,
            quantity,
            unit_id,
            threshold: threshold || 0,
            price,
            currency_id,
            created_by: authorize.id,
        };

        await createInventoryItemModel(itemData);
        callBack(resultObject(true, "Inventory item created successfully"));
    } catch (error) {
        console.error("Error in createInventoryItem:", error);
        callBack(
            resultObject(
                false,
                error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
                null,
                error instanceof CustomError ? error.statusCode : 500
            )
        );
    }
};

const updateInventoryItem = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1)) {
            throw new CustomError("You don't have permission to update inventory items!", 403);
        }

        const { id } = request.params;
        if (!id) {
            throw new CustomError("Item ID is required", 400);
        }

        const { name, quantity, unit_id, threshold, price, currency_id } = request.body;

        // Validate required fields
        if (!name || !quantity || !unit_id || !price || !currency_id) {
            throw new CustomError("Missing required fields", 400);
        }

        // Validate numeric fields
        if (isNaN(quantity) || quantity < 0) {
            throw new CustomError("Quantity must be a non-negative number", 400);
        }

        if (isNaN(price) || price < 0) {
            throw new CustomError("Price must be a non-negative number", 400);
        }

        if (threshold && (isNaN(threshold) || threshold < 0)) {
            throw new CustomError("Threshold must be a non-negative number", 400);
        }

        const itemData = {
            name,
            quantity,
            unit_id,
            threshold: threshold || 0,
            price,
            currency_id,
            updated_by: authorize.id,
        };

        await updateInventoryItemModel(id, itemData);
        callBack(resultObject(true, "Inventory item updated successfully"));
    } catch (error) {
        console.error("Error in updateInventoryItem:", error);
        callBack(
            resultObject(
                false,
                error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
                null,
                error instanceof CustomError ? error.statusCode : 500
            )
        );
    }
};

const deleteInventoryItem = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.roles?.includes(1)) {
            throw new CustomError("You don't have permission to delete inventory items!", 403);
        }

        const { id } = request.params;
        if (!id) {
            throw new CustomError("Item ID is required", 400);
        }

        await deleteInventoryItemModel(id, authorize.id);
        callBack(resultObject(true, "Inventory item deleted successfully"));
    } catch (error) {
        console.error("Error in deleteInventoryItem:", error);
        callBack(
            resultObject(
                false,
                error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
                null,
                error instanceof CustomError ? error.statusCode : 500
            )
        );
    }
};

const getInventoryHistory = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.roles?.includes(1)) {
            throw new CustomError("You don't have permission to view inventory history!", 403);
        }

        const { id } = request.params;
        if (!id) {
            throw new CustomError("Item ID is required", 400);
        }

        const result = await getInventoryHistoryModel(id);
        callBack(resultObject(true, "Inventory history retrieved successfully", result));
    } catch (error) {
        console.error("Error in getInventoryHistory:", error);
        callBack(
            resultObject(
                false,
                error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
                null,
                error instanceof CustomError ? error.statusCode : 500
            )
        );
    }
};

const getInventoryWithBatchesByRestaurant = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1) && authorize?.department_id !== 2 && authorize?.department_id !== 4) {
            throw new CustomError("You don't have permission to view inventory with batches!", 403);
        }

        const { restaurant_id } = request.params;

        // Use restaurant_id from params or user's restaurant_id
        const actualRestaurantId = restaurant_id || authorize.restaurant_id;

        if (!actualRestaurantId) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        // Restrict restaurant admins to their own restaurant
        if (authorize?.department_id === 2 && actualRestaurantId != authorize.restaurant_id) {
            throw new CustomError("You can only view inventory for your own restaurant", 403);
        }

        const pagination = {
            page: request.query.page || 1,
            limit: request.query.limit || 10,
            search: request.query.search || "",
            sort_by: request.query.sort_by || "name",
            sort_order: request.query.sort_order || "ASC",
            status_filter: request.query.status_filter || "all",
        };

        const result = await getInventoryWithBatchesByRestaurantModel(actualRestaurantId, pagination);

        callBack(resultObject(true, "Inventory with batches retrieved successfully", result));
    } catch (error) {
        console.error("Error in getInventoryWithBatchesByRestaurant:", error);
        callBack(
            resultObject(
                false,
                error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
                null,
                error instanceof CustomError ? error.statusCode : 500
            )
        );
    }
};

/**
 * Check stock availability for specific quantity
 */
const checkStockAvailabilityController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1) && authorize?.department_id !== 2 && authorize?.department_id !== 4) {
            throw new CustomError("You don't have permission to check stock!", 403);
        }

        const { inventory_id } = request.params;
        const { quantity = 1 } = request.query;

        if (!inventory_id) {
            throw new CustomError("Inventory ID is required", 400);
        }

        if (isNaN(quantity) || quantity <= 0) {
            throw new CustomError("Quantity must be a positive number", 400);
        }

        const { checkStockAvailabilityModel } = require("./model");
        const result = await checkStockAvailabilityModel(inventory_id, parseFloat(quantity));

        if (result) {
            callBack(resultObject(true, "Stock availability checked", result));
        } else {
            callBack(resultObject(false, "Inventory item not found"));
        }
    } catch (error) {
        console.error("Error in checkStockAvailability:", error);
        callBack(
            resultObject(
                false,
                error instanceof CustomError ? error.message : "Something went wrong",
                null,
                error instanceof CustomError ? error.statusCode : 500
            )
        );
    }
};

/**
 * Get inventory dashboard data
 */
const getInventoryDashboardController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1) && authorize?.department_id !== 2 && authorize?.department_id !== 4) {
            throw new CustomError("You don't have permission to view inventory dashboard!", 403);
        }

        const { restaurant_id } = request.params;
        const actualRestaurantId = restaurant_id || authorize.restaurant_id;

        if (!actualRestaurantId) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        // Get low stock items
        const { getLowStockItemsModel } = require("./model");
        const lowStockItems = await getLowStockItemsModel(actualRestaurantId);

        // Get expiring batches
        const { getExpiringBatchesModel } = require("../inventory-batches/model");
        const expiringBatches = await getExpiringBatchesModel(actualRestaurantId, 7);

        // Get recent stock movements (last 10)
        const recentMovementsQuery = `
            SELECT 
                sm.id,
                sm.quantity,
                sm.notes,
                sm.created_at,
                inv.name as item_name,
                u.name as created_by_user,
                CASE 
                    WHEN sm.quantity > 0 THEN 'stock_in'
                    ELSE 'stock_out'
                END as movement_type
            FROM stock_movements sm
            LEFT JOIN inventory inv ON sm.item_id = inv.id
            LEFT JOIN users u ON sm.created_by = u.id
            WHERE inv.restaurant_id = ?
            ORDER BY sm.created_at DESC
            LIMIT 10
        `;

        const recentMovements = await executeQuery(recentMovementsQuery, [actualRestaurantId], "getRecentMovements");

        // Calculate summary stats
        const totalItems = await executeQuery(
            "SELECT COUNT(*) as total FROM inventory WHERE restaurant_id = ? AND deleted_at IS NULL",
            [actualRestaurantId],
            "getTotalItems"
        );

        callBack(
            resultObject(true, "Inventory dashboard data retrieved", {
                summary: {
                    total_items: totalItems[0]?.total || 0,
                    low_stock_count: lowStockItems.length,
                    expiring_batches_count: expiringBatches.length,
                    critical_alerts: lowStockItems.filter((item) => item.quantity === 0).length,
                },
                low_stock_items: lowStockItems.slice(0, 5), // Top 5 most critical
                expiring_batches: expiringBatches.slice(0, 5), // Next 5 expiring
                recent_movements: recentMovements,
            })
        );
    } catch (error) {
        console.error("Error in getInventoryDashboard:", error);
        callBack(
            resultObject(
                false,
                error instanceof CustomError ? error.message : "Something went wrong",
                null,
                error instanceof CustomError ? error.statusCode : 500
            )
        );
    }
};

module.exports = {
    getInventoryItemsController: getInventoryItems,
    getInventoryItemsByRestaurantIDController: getInventoryItemsByRestaurantID,
    getLowStockItemsController: getLowStockItems,
    createInventoryItemController: createInventoryItem,
    updateInventoryItemController: updateInventoryItem,
    deleteInventoryItemController: deleteInventoryItem,
    getInventoryHistoryController: getInventoryHistory,
    getInventoryWithBatchesByRestaurantController: getInventoryWithBatchesByRestaurant,
    checkStockAvailabilityController,
    getInventoryDashboardController,
};
