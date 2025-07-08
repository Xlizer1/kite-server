// src/api/v1/captain/controller.js (Enhanced version)

const {
    getRestaurantTablesModel,
    getPendingOrdersModel,
    getActiveOrdersModel,
    updateOrderStatusModel,
    getPendingCaptainCallsModel,
    updateCaptainCallModel,
    getTablesWithOrdersStatsModel,
    getMenuForOrderingModel,
    updateTableStatusModel,
    getCaptainDashboardModel,
    assignCaptainToTablesModel,
    createOrderForTableModel,
} = require("./model");

const { resultObject, verifyUserToken, getToken } = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");

/**
 * Get all tables for a restaurant
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getRestaurantTablesController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        const result = await getRestaurantTablesModel(authorize.restaurant_id);

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
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        const result = await getPendingOrdersModel(authorize.restaurant_id);

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
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        const result = await getActiveOrdersModel(authorize.restaurant_id);

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
 * Update order status (ENHANCED with notifications)
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const updateOrderStatusController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        const { order_id } = request.params;
        const { status_id, notes } = request.body;

        if (!order_id || !status_id) {
            return callBack(resultObject(false, "Order ID and status ID are required"));
        }

        // Get order details before updating (for notifications)
        const orderDetailsQuery = `
            SELECT 
                o.id,
                o.table_id,
                o.restaurant_id,
                t.number as table_number,
                COUNT(oi.id) as items_count,
                o.status_id as current_status
            FROM orders o
            JOIN tables t ON o.table_id = t.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id = ?
            GROUP BY o.id
        `;

        const orderDetails = await executeQuery(orderDetailsQuery, [order_id], "getOrderDetailsForNotification");

        if (!orderDetails || orderDetails.length === 0) {
            return callBack(resultObject(false, "Order not found"));
        }

        const order = orderDetails[0];

        const result = await updateOrderStatusModel({
            order_id,
            status_id,
            user_id: authorize.id,
            notes,
        });

        if (result) {
            // 🔥 NOTIFICATION INTEGRATION: Send notifications based on status change
            try {
                const firebaseRealtimeService = require("../../../services/firebaseRealtimeService");

                // Status 2 = Captain Approved → Notify Kitchen
                if (parseInt(status_id) === 2) {
                    console.log(`📧 Sending kitchen notification for approved order #${order_id}`);

                    // Send notification to kitchen staff
                    await firebaseRealtimeService.sendNotification({
                        restaurantId: order.restaurant_id,
                        departments: [6], // KITCHEN department
                        type: "NEW_ORDER_KITCHEN",
                        title: "New Order for Kitchen",
                        message: `Table ${order.table_number} - ${order.items_count} items approved`,
                        data: {
                            orderId: order.id,
                            tableId: order.table_id,
                            tableNumber: order.table_number,
                            itemsCount: order.items_count,
                        },
                        priority: "high",
                        actionRequired: true,
                        sound: "notification",
                    });

                    console.log(`✅ Kitchen notification sent for order #${order_id}`);
                }

                // Status 3 = In Kitchen → Could send update to captains
                else if (parseInt(status_id) === 3) {
                    console.log(`📧 Order #${order_id} moved to kitchen`);

                    // Optional: Notify captains that order is being prepared
                    await firebaseRealtimeService.sendNotification({
                        restaurantId: order.restaurant_id,
                        departments: [5], // CAPTAIN department
                        type: "ORDER_IN_KITCHEN",
                        title: "Order Being Prepared",
                        message: `Table ${order.table_number} order is now being prepared`,
                        data: {
                            orderId: order.id,
                            tableNumber: order.table_number,
                        },
                        priority: "low",
                    });
                }

                // Status 4 = Ready → Notify Captains for pickup
                else if (parseInt(status_id) === 4) {
                    console.log(`📧 Sending pickup notification for ready order #${order_id}`);

                    await firebaseRealtimeService.sendNotification({
                        restaurantId: order.restaurant_id,
                        departments: [5], // CAPTAIN department
                        type: "ORDER_READY_PICKUP",
                        title: "🍽️ Order Ready for Pickup",
                        message: `Table ${order.table_number} order is ready!`,
                        data: {
                            orderId: order.id,
                            tableId: order.table_id,
                            tableNumber: order.table_number,
                        },
                        priority: "high",
                        actionRequired: true,
                        sound: "notification",
                    });

                    console.log(`✅ Pickup notification sent for order #${order_id}`);
                }
            } catch (notificationError) {
                console.error("Failed to send notification:", notificationError);
                // Don't fail the status update if notification fails
            }

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
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        const result = await getPendingCaptainCallsModel(authorize.restaurant_id);

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
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        const { call_id } = request.params;
        const { status } = request.body;

        if (!call_id || !status) {
            return callBack(resultObject(false, "Call ID and status are required"));
        }

        if (!["in_progress", "completed", "cancelled"].includes(status)) {
            return callBack(resultObject(false, "Invalid status. Must be one of: in_progress, completed, cancelled"));
        }

        const result = await updateCaptainCallModel({
            call_id,
            status,
            user_id: authorize.id,
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
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        const result = await getTablesWithOrdersStatsModel(authorize.restaurant_id);

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

/**
 * Create order directly for any table (Captain assistance)
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const createOrderForTableController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        const { table_id, items, special_request, allergy_info, customer_name } = request.body;

        if (!table_id) {
            return callBack(resultObject(false, "Table ID is required"));
        }

        if (!items || !Array.isArray(items) || items.length === 0) {
            return callBack(resultObject(false, "At least one item is required"));
        }

        // Validate items structure
        for (const item of items) {
            if (!item.item_id || !item.quantity || item.quantity <= 0) {
                return callBack(resultObject(false, "Each item must have item_id and positive quantity"));
            }
        }

        const result = await createOrderForTableModel({
            table_id,
            items,
            special_request,
            allergy_info,
            customer_name,
            created_by: authorize.id,
            restaurant_id: authorize.restaurant_id,
        });

        if (result && result.order_id) {
            callBack(
                resultObject(true, "Order created successfully", {
                    order_id: result.order_id,
                    table_number: result.table_number,
                    total_items: items.length,
                    created_by: authorize.name || authorize.username,
                })
            );
        } else {
            callBack(resultObject(false, "Failed to create order"));
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
 * Get available menu items for ordering
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getMenuForOrderingController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        const result = await getMenuForOrderingModel(authorize.restaurant_id);

        if (Array.isArray(result)) {
            callBack(resultObject(true, "Menu retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve menu"));
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

/**
 * Update table status (occupied/free)
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const updateTableStatusController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        const { table_id } = request.params;
        const { status, customer_count, notes } = request.body;

        if (!table_id || !status) {
            return callBack(resultObject(false, "Table ID and status are required"));
        }

        const result = await updateTableStatusModel({
            table_id,
            status, // 1 = free, 2 = occupied, 3 = reserved, 4 = cleaning
            customer_count,
            notes,
            updated_by: authorize.id,
            restaurant_id: authorize.restaurant_id,
        });

        if (result) {
            // Trigger real-time notification
            const realtimeService = require("../../../services/realtimeService");
            realtimeService.notifyTableStatusChange(authorize.restaurant_id, {
                table_id: parseInt(table_id),
                status,
                customer_count,
                updated_by: authorize.id,
                updated_at: new Date(),
            });

            callBack(resultObject(true, "Table status updated successfully"));
        } else {
            callBack(resultObject(false, "Failed to update table status"));
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

/**
 * Get captain dashboard summary
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getCaptainDashboardController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        const result = await getCaptainDashboardModel(authorize.restaurant_id);

        if (result) {
            callBack(resultObject(true, "Dashboard data retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve dashboard data"));
        }
    } catch (error) {
        console.error(error);
        callBack(resultObject(false, "Something went wrong, please try again later"));
    }
};

/**
 * Assign captain to specific tables
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const assignCaptainToTablesController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        const { table_ids } = request.body;

        if (!table_ids || !Array.isArray(table_ids)) {
            return callBack(resultObject(false, "Table IDs array is required"));
        }

        const result = await assignCaptainToTablesModel({
            captain_id: authorize.id,
            table_ids,
            restaurant_id: authorize.restaurant_id,
        });

        if (result) {
            callBack(resultObject(true, "Tables assigned successfully"));
        } else {
            callBack(resultObject(false, "Failed to assign tables"));
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
    getTablesWithOrdersStatsController,
    createOrderForTableController,
    getMenuForOrderingController,
    updateTableStatusController,
    getCaptainDashboardController,
    assignCaptainToTablesController,
};
