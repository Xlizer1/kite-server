// src/api/v1/cashier/controller.js

const { 
    getTablesWithActiveBillsModel,
    getOrdersForBillingModel,
    getAvailableDiscountsModel,
    createInvoiceModel,
    getInvoiceDetailsModel,
    generateReceiptPdfModel,
    getCashierReportModel
} = require("./model");

const { resultObject, verifyUserToken } = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");

/**
 * Get tables with active bills
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getTablesWithActiveBillsController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(8)) {
            return callBack(resultObject(false, "You don't have permission to view active bills"));
        }
        
        const result = await getTablesWithActiveBillsModel(request);
        
        if (Array.isArray(result)) {
            callBack(resultObject(true, "Tables with active bills retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve tables with active bills"));
            console.log(result);
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

/**
 * Get orders for billing
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getOrdersForBillingController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(8)) {
            return callBack(resultObject(false, "You don't have permission to view orders for billing"));
        }
        
        const { table_id } = request.params;
        
        if (!table_id) {
            return callBack(resultObject(false, "Table ID is required"));
        }
        
        const result = await getOrdersForBillingModel(request);
        
        if (Array.isArray(result)) {
            callBack(resultObject(true, "Orders for billing retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve orders for billing"));
            console.log(result);
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

/**
 * Get available discounts
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getAvailableDiscountsController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(8)) {
            return callBack(resultObject(false, "You don't have permission to view available discounts"));
        }
        
        const result = await getAvailableDiscountsModel(request);
        
        if (Array.isArray(result)) {
            callBack(resultObject(true, "Available discounts retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve available discounts"));
            console.log(result);
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

/**
 * Create invoice
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const createInvoiceController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(8)) {
            return callBack(resultObject(false, "You don't have permission to create invoices"));
        }
        
        const { order_ids, discount_id, payment_method_id, payment_status_id, notes } = request.body;
        
        if (!order_ids || !Array.isArray(order_ids) || order_ids.length === 0) {
            return callBack(resultObject(false, "At least one order ID is required"));
        }
        
        if (!payment_method_id) {
            return callBack(resultObject(false, "Payment method is required"));
        }
        
        if (!payment_status_id) {
            return callBack(resultObject(false, "Payment status is required"));
        }
        
        const result = await createInvoiceModel({
            order_ids,
            discount_id,
            payment_method_id,
            payment_status_id,
            notes,
            user_id: authorize.id
        });
        
        if (result && result.id) {
            callBack(resultObject(true, "Invoice created successfully", result));
        } else {
            callBack(resultObject(false, "Failed to create invoice"));
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
 * Get invoice details
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getInvoiceDetailsController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(8)) {
            return callBack(resultObject(false, "You don't have permission to view invoice details"));
        }
        
        const { invoice_id } = request.params;
        
        if (!invoice_id) {
            return callBack(resultObject(false, "Invoice ID is required"));
        }
        
        const result = await getInvoiceDetailsModel(request);
        
        if (result && result.id) {
            callBack(resultObject(true, "Invoice details retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve invoice details"));
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
 * Generate receipt PDF
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const generateReceiptPdfController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(8)) {
            return callBack(resultObject(false, "You don't have permission to generate receipts"));
        }
        
        const { invoice_id } = request.params;
        
        if (!invoice_id) {
            return callBack(resultObject(false, "Invoice ID is required"));
        }
        
        // Add user info to request for the model
        request.user = {
            id: authorize.id
        };
        
        const result = await generateReceiptPdfModel(request);
        
        if (result && result.receipt_number) {
            callBack(resultObject(true, "Receipt generated successfully", result));
        } else {
            callBack(resultObject(false, "Failed to generate receipt"));
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
 * Get cashier sales report
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getCashierReportController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        
        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(8)) {
            return callBack(resultObject(false, "You don't have permission to view sales reports"));
        }
        
        const result = await getCashierReportModel(request);
        
        if (result) {
            callBack(resultObject(true, "Sales report retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve sales report"));
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
    getTablesWithActiveBillsController,
    getOrdersForBillingController,
    getAvailableDiscountsController,
    createInvoiceController,
    getInvoiceDetailsController,
    generateReceiptPdfController,
    getCashierReportController
};