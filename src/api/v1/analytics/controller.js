// src/api/v1/analytics/controller.js

const { 
    getDailySalesModel,
    getSalesByCategoryModel,
    getTopSellingItemsModel,
    getHourlySalesModel,
    getInventoryUsageModel,
    getDashboardSummaryModel,
    getRevenueComparisonModel
} = require("./model");

const { resultObject, verifyUserToken } = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");

/**
 * Get daily sales data
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getDailySalesController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        // Check for appropriate permission (manager or admin)
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(2)) {
            return callBack(resultObject(false, "You don't have permission to view sales analytics"));
        }
        
        const { restaurant_id, start_date, end_date } = request.query;
        
        // If no restaurant_id specified and user is a restaurant admin, use their restaurant_id
        const actualRestaurantId = restaurant_id || 
            (authorize?.roles?.includes(2) ? authorize.restaurant_id : null);
        
        if (!actualRestaurantId) {
            return callBack(resultObject(false, "Restaurant ID is required"));
        }
        
        const result = await getDailySalesModel({
            restaurant_id: actualRestaurantId,
            start_date,
            end_date
        });
        
        if (Array.isArray(result)) {
            callBack(resultObject(true, "Daily sales data retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve daily sales data"));
        }
    } catch (error) {
        console.error(error);
        
        if (error.message && error.statusCode) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong, please try again later"));
        }
    }
};

/**
 * Get sales by category
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getSalesByCategoryController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        // Check for appropriate permission (manager or admin)
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(2)) {
            return callBack(resultObject(false, "You don't have permission to view sales analytics"));
        }
        
        const { restaurant_id, start_date, end_date } = request.query;
        
        // If no restaurant_id specified and user is a restaurant admin, use their restaurant_id
        const actualRestaurantId = restaurant_id || 
            (authorize?.roles?.includes(2) ? authorize.restaurant_id : null);
        
        if (!actualRestaurantId) {
            return callBack(resultObject(false, "Restaurant ID is required"));
        }
        
        const result = await getSalesByCategoryModel({
            restaurant_id: actualRestaurantId,
            start_date,
            end_date
        });
        
        if (Array.isArray(result)) {
            callBack(resultObject(true, "Sales by category data retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve sales by category data"));
        }
    } catch (error) {
        console.error(error);
        
        if (error.message && error.statusCode) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong, please try again later"));
        }
    }
};

/**
 * Get top selling items
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getTopSellingItemsController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        // Check for appropriate permission (manager or admin)
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(2)) {
            return callBack(resultObject(false, "You don't have permission to view sales analytics"));
        }
        
        const { restaurant_id, start_date, end_date, limit } = request.query;
        
        // If no restaurant_id specified and user is a restaurant admin, use their restaurant_id
        const actualRestaurantId = restaurant_id || 
            (authorize?.roles?.includes(2) ? authorize.restaurant_id : null);
        
        if (!actualRestaurantId) {
            return callBack(resultObject(false, "Restaurant ID is required"));
        }
        
        const result = await getTopSellingItemsModel({
            restaurant_id: actualRestaurantId,
            start_date,
            end_date,
            limit
        });
        
        if (Array.isArray(result)) {
            callBack(resultObject(true, "Top selling items data retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve top selling items data"));
        }
    } catch (error) {
        console.error(error);
        
        if (error.message && error.statusCode) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong, please try again later"));
        }
    }
};

/**
 * Get hourly sales distribution
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getHourlySalesController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        // Check for appropriate permission (manager or admin)
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(2)) {
            return callBack(resultObject(false, "You don't have permission to view sales analytics"));
        }
        
        const { restaurant_id, start_date, end_date } = request.query;
        
        // If no restaurant_id specified and user is a restaurant admin, use their restaurant_id
        const actualRestaurantId = restaurant_id || 
            (authorize?.roles?.includes(2) ? authorize.restaurant_id : null);
        
        if (!actualRestaurantId) {
            return callBack(resultObject(false, "Restaurant ID is required"));
        }
        
        const result = await getHourlySalesModel({
            restaurant_id: actualRestaurantId,
            start_date,
            end_date
        });
        
        if (Array.isArray(result)) {
            callBack(resultObject(true, "Hourly sales data retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve hourly sales data"));
        }
    } catch (error) {
        console.error(error);
        
        if (error.message && error.statusCode) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong, please try again later"));
        }
    }
};

/**
 * Get inventory usage report
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getInventoryUsageController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        // Check for appropriate permission (manager, admin, or inventory admin)
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(2) && !authorize?.roles?.includes(4)) {
            return callBack(resultObject(false, "You don't have permission to view inventory analytics"));
        }
        
        const { restaurant_id, start_date, end_date } = request.query;
        
        // If no restaurant_id specified and user is a restaurant admin, use their restaurant_id
        const actualRestaurantId = restaurant_id || 
            (authorize?.roles?.includes(2) ? authorize.restaurant_id : null);
        
        if (!actualRestaurantId) {
            return callBack(resultObject(false, "Restaurant ID is required"));
        }
        
        const result = await getInventoryUsageModel({
            restaurant_id: actualRestaurantId,
            start_date,
            end_date
        });
        
        if (Array.isArray(result)) {
            callBack(resultObject(true, "Inventory usage data retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve inventory usage data"));
        }
    } catch (error) {
        console.error(error);
        
        if (error.message && error.statusCode) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong, please try again later"));
        }
    }
};

/**
 * Get dashboard summary
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getDashboardSummaryController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        // Check for appropriate permission (manager or admin)
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(2)) {
            return callBack(resultObject(false, "You don't have permission to view dashboard analytics"));
        }
        
        const { restaurant_id } = request.query;
        
        // If no restaurant_id specified and user is a restaurant admin, use their restaurant_id
        const actualRestaurantId = restaurant_id || 
            (authorize?.roles?.includes(2) ? authorize.restaurant_id : null);
        
        if (!actualRestaurantId) {
            return callBack(resultObject(false, "Restaurant ID is required"));
        }
        
        const result = await getDashboardSummaryModel({
            restaurant_id: actualRestaurantId
        });
        
        if (result) {
            callBack(resultObject(true, "Dashboard summary data retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve dashboard summary data"));
        }
    } catch (error) {
        console.error(error);
        
        if (error.message && error.statusCode) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong, please try again later"));
        }
    }
};

/**
 * Get revenue comparison
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getRevenueComparisonController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        // Check for appropriate permission (manager or admin)
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(2)) {
            return callBack(resultObject(false, "You don't have permission to view revenue analytics"));
        }
        
        const { restaurant_id, period, start_date, end_date } = request.query;
        
        // If no restaurant_id specified and user is a restaurant admin, use their restaurant_id
        const actualRestaurantId = restaurant_id || 
            (authorize?.roles?.includes(2) ? authorize.restaurant_id : null);
        
        if (!actualRestaurantId) {
            return callBack(resultObject(false, "Restaurant ID is required"));
        }
        
        const result = await getRevenueComparisonModel({
            restaurant_id: actualRestaurantId,
            period,
            start_date,
            end_date
        });
        
        if (result) {
            callBack(resultObject(true, "Revenue comparison data retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve revenue comparison data"));
        }
    } catch (error) {
        console.error(error);
        
        if (error.message && error.statusCode) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong, please try again later"));
        }
    }
};

module.exports = {
    getDailySalesController,
    getSalesByCategoryController,
    getTopSellingItemsController,
    getHourlySalesController,
    getInventoryUsageController,
    getDashboardSummaryController,
    getRevenueComparisonController
};