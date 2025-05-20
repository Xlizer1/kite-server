// src/api/v1/kitchen/controller.js

const { 
    getPendingKitchenOrdersModel,
    getInProgressKitchenOrdersModel,
    startProcessingOrderModel,
    completeOrderModel,
    getLowInventoryItemsModel,
    getKitchenOrderHistoryModel
} = require("./model");

const { resultObject, verifyUserToken } = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");

/**
 * Get pending kitchen orders
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getPendingKitchenOrdersController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"]);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(6)) {
            return callBack(resultObject(false, "You don't have permission to view kitchen orders"));
        }
        
        const result = await getPendingKitchenOrdersModel(request);
        
        if (Array.isArray(result)) {
            callBack(resultObject(true, "Pending kitchen orders retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve pending kitchen orders"));
            console.log(result);
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

/**
 * Get in-progress kitchen orders
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getInProgressKitchenOrdersController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"]);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(6)) {
            return callBack(resultObject(false, "You don't have permission to view kitchen orders"));
        }
        
        const result = await getInProgressKitchenOrdersModel(request);
        
        if (Array.isArray(result)) {
            callBack(resultObject(true, "In-progress kitchen orders retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve in-progress kitchen orders"));
            console.log(result);
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

/**
 * Start processing an order in the kitchen
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const startProcessingOrderController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"]);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(6)) {
            return callBack(resultObject(false, "You don't have permission to process kitchen orders"));
        }
        
        const { order_id } = request.params;
        const { estimated_minutes } = request.body;
        
        if (!order_id) {
            return callBack(resultObject(false, "Order ID is required"));
        }
        
        const result = await startProcessingOrderModel({
            order_id,
            user_id: authorize.id,
            estimated_minutes
        });
        
        if (result) {
            callBack(resultObject(true, "Order processing started successfully"));
        } else {
            callBack(resultObject(false, "Failed to start processing order"));
        }
    } catch (error) {
        console.error(error);
        
        // If inventory-related error, provide more specific message
        if (error.message && error.message.includes("inventory")) {
            callBack(resultObject(false, `Inventory error: ${error.message}`));
        } else {
            callBack(resultObject(false, "Something went wrong, please try again later"));
        }
    }
};

/**
 * Complete an order in the kitchen
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const completeOrderController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"]);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(6)) {
            return callBack(resultObject(false, "You don't have permission to complete kitchen orders"));
        }
        
        const { order_id } = request.params;
        const { notes } = request.body;
        
        if (!order_id) {
            return callBack(resultObject(false, "Order ID is required"));
        }
        
        const result = await completeOrderModel({
            order_id,
            user_id: authorize.id,
            notes
        });
        
        if (result) {
            callBack(resultObject(true, "Order completed successfully"));
        } else {
            callBack(resultObject(false, "Failed to complete order"));
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

/**
 * Get low inventory items
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getLowInventoryItemsController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"]);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(6) && !authorize?.roles?.includes(4)) {
            return callBack(resultObject(false, "You don't have permission to view inventory items"));
        }
        
        const result = await getLowInventoryItemsModel(request);
        
        if (Array.isArray(result)) {
            callBack(resultObject(true, "Low inventory items retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve low inventory items"));
            console.log(result);
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

/**
 * Get kitchen order history
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getKitchenOrderHistoryController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"]);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(6)) {
            return callBack(resultObject(false, "You don't have permission to view kitchen order history"));
        }
        
        const result = await getKitchenOrderHistoryModel(request);
        
        if (Array.isArray(result)) {
            callBack(resultObject(true, "Kitchen order history retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve kitchen order history"));
            console.log(result);
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

module.exports = {
    getPendingKitchenOrdersController,
    getInProgressKitchenOrdersController,
    startProcessingOrderController,
    completeOrderController,
    getLowInventoryItemsController,
    getKitchenOrderHistoryController
};