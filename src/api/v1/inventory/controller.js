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

module.exports = {
    getInventoryItemsController: getInventoryItems,
    getInventoryItemsByRestaurantIDController: getInventoryItemsByRestaurantID,
    getLowStockItemsController: getLowStockItems,
    createInventoryItemController: createInventoryItem,
    updateInventoryItemController: updateInventoryItem,
    deleteInventoryItemController: deleteInventoryItem,
    getInventoryHistoryController: getInventoryHistory,
    getInventoryWithBatchesByRestaurantController: getInventoryWithBatchesByRestaurant,
};
