// src/api/v1/captain/controller.js (Enhanced version)

const { 
    getRestaurantTablesModel, 
    getPendingOrdersModel,
    getActiveOrdersModel, 
    updateOrderStatusModel,
    getPendingCaptainCallsModel,
    updateCaptainCallModel,
    getTablesWithOrdersStatsModel
} = require("./model");

const { resultObject, verifyUserToken } = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");

/**
 * Get all tables for a restaurant
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getRestaurantTablesController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(5)) {
            return callBack(resultObject(false, "You don't have permission to view tables"));
        }
        
        const result = await getRestaurantTablesModel(request);
        
        if (Array.isArray(result)) {
            callBack(resultObject(true, "Tables retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve tables"));
            console.log(result);
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

/**
 * Get pending orders that need captain approval
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getPendingOrdersController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(5)) {
            return callBack(resultObject(false, "You don't have permission to view pending orders"));
        }
        
        const result = await getPendingOrdersModel(request);
        
        if (Array.isArray(result)) {
            callBack(resultObject(true, "Pending orders retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve pending orders"));
            console.log(result);
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

/**
 * Get active orders (approved and in kitchen)
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getActiveOrdersController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(5)) {
            return callBack(resultObject(false, "You don't have permission to view active orders"));
        }
        
        const result = await getActiveOrdersModel(request);
        
        if (Array.isArray(result)) {
            callBack(resultObject(true, "Active orders retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve active orders"));
            console.log(result);
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

/**
 * Update order status
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const updateOrderStatusController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(5)) {
            return callBack(resultObject(false, "You don't have permission to update order status"));
        }
        
        const { order_id } = request.params;
        const { status_id, notes } = request.body;
        
        if (!order_id || !status_id) {
            return callBack(resultObject(false, "Order ID and status ID are required"));
        }
        
        const result = await updateOrderStatusModel({
            order_id,
            status_id,
            user_id: authorize.id,
            notes
        });
        
        if (result) {
            callBack(resultObject(true, "Order status updated successfully"));
        } else {
            callBack(resultObject(false, "Failed to update order status"));
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

/**
 * Get pending captain calls
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getPendingCaptainCallsController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(5)) {
            return callBack(resultObject(false, "You don't have permission to view captain calls"));
        }
        
        const result = await getPendingCaptainCallsModel(request);
        
        if (Array.isArray(result)) {
            callBack(resultObject(true, "Captain calls retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve captain calls"));
            console.log(result);
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

/**
 * Update captain call status
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const updateCaptainCallController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(5)) {
            return callBack(resultObject(false, "You don't have permission to update captain calls"));
        }
        
        const { call_id } = request.params;
        const { status } = request.body;
        
        if (!call_id || !status) {
            return callBack(resultObject(false, "Call ID and status are required"));
        }
        
        if (!['in_progress', 'completed', 'cancelled'].includes(status)) {
            return callBack(resultObject(false, "Invalid status. Must be one of: in_progress, completed, cancelled"));
        }
        
        const result = await updateCaptainCallModel({
            call_id,
            status,
            user_id: authorize.id
        });
        
        if (result) {
            callBack(resultObject(true, "Captain call updated successfully"));
        } else {
            callBack(resultObject(false, "Failed to update captain call"));
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

/**
 * Get tables with orders statistics
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getTablesWithOrdersStatsController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(5)) {
            return callBack(resultObject(false, "You don't have permission to view table statistics"));
        }
        
        const result = await getTablesWithOrdersStatsModel(request);
        
        if (Array.isArray(result)) {
            callBack(resultObject(true, "Table statistics retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve table statistics"));
            console.log(result);
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

module.exports = {
    getRestaurantTablesController,
    getPendingOrdersController,
    getActiveOrdersController,
    updateOrderStatusController,
    getPendingCaptainCallsController,
    updateCaptainCallController,
    getTablesWithOrdersStatsController
};