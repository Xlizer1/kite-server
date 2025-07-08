const {
    getPendingKitchenOrdersModel,
    getInProgressKitchenOrdersModel,
    startProcessingOrderModel,
    completeOrderModel,
    getLowInventoryItemsModel,
    getKitchenOrderHistoryModel,
} = require("./model");

const { getRecipeWithAvailabilityModel } = require("../ingredients/model");
// const { updateOrderStatusWithIngredientsModel, getOrderWithIngredientDetailsModel } = require("../orders/model");
const { getExpiringBatchesModel } = require("../inventory-batches/model");

const { resultObject, verifyUserToken, getToken } = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");

/**
 * Get pending kitchen orders
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const getPendingKitchenOrdersController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

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
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

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
 * Start processing an order in the kitchen (ENHANCED with notifications)
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const startProcessingOrderController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(6)) {
            return callBack(resultObject(false, "You don't have permission to process kitchen orders"));
        }

        const { order_id } = request.params;
        const { estimated_minutes } = request.body;

        if (!order_id) {
            return callBack(resultObject(false, "Order ID is required"));
        }

        // Get order details for notifications
        const orderDetailsQuery = `
            SELECT 
                o.id,
                o.table_id,
                o.restaurant_id,
                t.number as table_number
            FROM orders o
            JOIN tables t ON o.table_id = t.id
            WHERE o.id = ?
        `;

        const orderDetails = await executeQuery(orderDetailsQuery, [order_id], "getOrderDetailsForProcessing");

        if (!orderDetails || orderDetails.length === 0) {
            return callBack(resultObject(false, "Order not found"));
        }

        const order = orderDetails[0];

        const result = await startProcessingOrderModel({
            order_id,
            user_id: authorize.id,
            estimated_minutes,
        });

        if (result) {
            // 🔥 NOTIFICATION: Optional - notify captains that order is being prepared
            try {
                const firebaseRealtimeService = require("../../../services/firebaseRealtimeService");

                await firebaseRealtimeService.sendNotification({
                    restaurantId: order.restaurant_id,
                    departments: [5], // CAPTAIN department
                    type: "ORDER_PROCESSING",
                    title: "Order Being Prepared",
                    message: `Table ${order.table_number} order is now being prepared${
                        estimated_minutes ? ` (Est. ${estimated_minutes} min)` : ""
                    }`,
                    data: {
                        orderId: order.id,
                        tableNumber: order.table_number,
                        estimatedMinutes: estimated_minutes || null,
                        kitchenStaff: authorize.name || `User ${authorize.id}`,
                    },
                    priority: "low", // Low priority since it's just an update
                });

                console.log(`📧 Order processing notification sent - Order #${order_id}`);
            } catch (notificationError) {
                console.error("Failed to send processing notification:", notificationError);
                // Don't fail the operation if notification fails
            }

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
 * Complete an order in the kitchen (ENHANCED with notifications)
 * @param {Object} request - Express request object
 * @param {Function} callBack - Callback function
 */
const completeOrderController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(6)) {
            return callBack(resultObject(false, "You don't have permission to complete kitchen orders"));
        }

        const { order_id } = request.params;
        const { notes } = request.body;

        if (!order_id) {
            return callBack(resultObject(false, "Order ID is required"));
        }

        // Get order details before completing (for notifications)
        const orderDetailsQuery = `
            SELECT 
                o.id,
                o.table_id,
                o.restaurant_id,
                t.number as table_number,
                COUNT(oi.id) as items_count
            FROM orders o
            JOIN tables t ON o.table_id = t.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.id = ? AND o.status_id = 3
            GROUP BY o.id
        `;

        const orderDetails = await executeQuery(orderDetailsQuery, [order_id], "getOrderDetailsForCompletion");

        if (!orderDetails || orderDetails.length === 0) {
            return callBack(resultObject(false, "Order not found or not in kitchen"));
        }

        const order = orderDetails[0];

        const result = await completeOrderModel({
            order_id,
            user_id: authorize.id,
            notes,
        });

        if (result) {
            // 🔥 NOTIFICATION: Send order ready notification to captains
            try {
                const firebaseRealtimeService = require("../../../services/firebaseRealtimeService");

                console.log(`📧 Sending order ready notification for order #${order_id}`);

                await firebaseRealtimeService.sendNotification({
                    restaurantId: order.restaurant_id,
                    departments: [5], // CAPTAIN department
                    type: "ORDER_READY_PICKUP",
                    title: "🍽️ Order Ready for Pickup!",
                    message: `Table ${order.table_number} order is ready for pickup`,
                    data: {
                        orderId: order.id,
                        tableId: order.table_id,
                        tableNumber: order.table_number,
                        itemsCount: order.items_count,
                        completedBy: authorize.name || `User ${authorize.id}`,
                        notes: notes || null,
                    },
                    priority: "high",
                    actionRequired: true,
                    sound: "notification",
                    actions: [
                        { action: "pickup", title: "Mark as Picked Up" },
                        { action: "view", title: "View Order" },
                    ],
                });

                console.log(`✅ Order ready notification sent to captains - Order #${order_id}`);
            } catch (notificationError) {
                console.error("Failed to send order ready notification:", notificationError);
                // Don't fail the completion if notification fails
            }

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
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

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
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

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

const getKitchenOrdersWithIngredients = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (authorize?.department_id !== 6) {
            // Kitchen department
            throw new CustomError("You don't have permission to view kitchen orders!", 403);
        }

        const restaurantId = authorize.restaurant_id;
        const { status = "pending" } = request.query;

        // Get orders for kitchen
        const ordersSql = `
            SELECT 
                o.id,
                o.table_id,
                o.status_id,
                o.special_request,
                o.allergy_info,
                o.created_at,
                o.estimated_ready_time,
                os.name AS status_name,
                t.number AS table_number,
                COUNT(oi.id) AS total_items,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'item_id', oi.item_id,
                        'item_name', i.name,
                        'quantity', oi.quantity,
                        'special_instructions', oi.special_instructions,
                        'is_shisha', i.is_shisha
                    )
                ) AS items
            FROM 
                orders o
            LEFT JOIN order_statuses os ON o.status_id = os.id
            LEFT JOIN tables t ON o.table_id = t.id
            LEFT JOIN order_items oi ON o.id = oi.order_id
            LEFT JOIN items i ON oi.item_id = i.id
            WHERE 
                o.restaurant_id = ?
                AND o.deleted_at IS NULL
                AND o.status_id IN (1, 2, 3) -- pending, in_progress, ready
            GROUP BY 
                o.id
            ORDER BY 
                o.created_at ASC
        `;

        const orders = await executeQuery(ordersSql, [restaurantId], "getKitchenOrders");

        // Add ingredient availability for each order
        const ordersWithIngredients = await Promise.all(
            orders.map(async (order) => {
                const itemsWithIngredients = await Promise.all(
                    order.items.map(async (item) => {
                        try {
                            const recipe = await getRecipeWithAvailabilityModel(item.item_id);
                            return {
                                ...item,
                                has_recipe: recipe.ingredients.length > 0,
                                ingredients_available: recipe.recipe_available,
                                missing_ingredients: recipe.ingredients
                                    .filter((ing) => !ing.sufficient_stock)
                                    .map((ing) => ing.inventory_name),
                                ingredient_count: recipe.ingredients.length,
                            };
                        } catch (error) {
                            return {
                                ...item,
                                has_recipe: false,
                                ingredients_available: true,
                                missing_ingredients: [],
                                ingredient_count: 0,
                            };
                        }
                    })
                );

                const allIngredientsAvailable = itemsWithIngredients.every((item) => item.ingredients_available);
                const totalMissingIngredients = itemsWithIngredients
                    .flatMap((item) => item.missing_ingredients)
                    .filter((ingredient, index, self) => self.indexOf(ingredient) === index);

                return {
                    ...order,
                    items: itemsWithIngredients,
                    can_prepare: allIngredientsAvailable,
                    missing_ingredients: totalMissingIngredients,
                    preparation_status: allIngredientsAvailable ? "ready" : "waiting_ingredients",
                };
            })
        );

        callBack(resultObject(true, "Kitchen orders retrieved successfully", ordersWithIngredients));
    } catch (error) {
        console.error("Error in getKitchenOrdersWithIngredients:", error);
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

// Enhanced function to start order preparation
const startOrderPreparation = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (authorize?.department_id !== 6) {
            throw new CustomError("You don't have permission to manage kitchen orders!", 403);
        }

        const { order_id, estimated_minutes } = request.body;

        if (!order_id) {
            throw new CustomError("Order ID is required", 400);
        }

        // Validate that all ingredients are available before starting preparation
        const orderDetailsSql = `
            SELECT oi.item_id, oi.quantity
            FROM order_items oi
            WHERE oi.order_id = ?
        `;
        const orderItems = await executeQuery(orderDetailsSql, [order_id], "getOrderItemsForPreparation");

        for (const item of orderItems) {
            try {
                const recipe = await getRecipeWithAvailabilityModel(item.item_id);
                if (recipe.ingredients.length > 0 && !recipe.recipe_available) {
                    const missingIngredients = recipe.ingredients
                        .filter((ing) => !ing.sufficient_stock)
                        .map((ing) => ing.inventory_name)
                        .join(", ");

                    throw new CustomError(`Cannot start preparation. Missing ingredients: ${missingIngredients}`, 400);
                }
            } catch (availabilityError) {
                if (availabilityError instanceof CustomError) {
                    throw availabilityError;
                }
                // No recipe found, can proceed
            }
        }

        // Update order status to "in preparation" (status_id = 2) and consume ingredients
        // await updateOrderStatusWithIngredientsModel(
        //     order_id,
        //     2, // In preparation status
        //     authorize.id,
        //     `Started preparation${estimated_minutes ? ` - estimated ${estimated_minutes} minutes` : ""}`
        // );

        // Update estimated ready time if provided
        if (estimated_minutes) {
            const estimatedReadyTime = new Date(Date.now() + estimated_minutes * 60000);
            const updateTimeSql = `
                UPDATE orders 
                SET estimated_ready_time = ?
                WHERE id = ?
            `;
            await executeQuery(updateTimeSql, [estimatedReadyTime, order_id], "updateEstimatedReadyTime");
        }

        callBack(resultObject(true, "Order preparation started successfully"));
    } catch (error) {
        console.error("Error in startOrderPreparation:", error);
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

// Function to get low stock alerts for kitchen
const getKitchenInventoryAlerts = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (authorize?.department_id !== 6) {
            throw new CustomError("You don't have permission to view inventory alerts!", 403);
        }

        const restaurantId = authorize.restaurant_id;

        // Get low stock items
        const lowStockSql = `
            SELECT 
                inv.id,
                inv.name,
                inv.quantity AS total_stock,
                inv.threshold,
                u.name AS unit_name,
                COALESCE(SUM(ib.current_quantity), 0) AS available_in_batches,
                COUNT(CASE WHEN ib.status = 'active' THEN 1 END) AS active_batches,
                (inv.threshold - COALESCE(SUM(ib.current_quantity), 0)) AS shortage
            FROM 
                inventory inv
            LEFT JOIN inventory_batches ib ON inv.id = ib.inventory_id 
                AND ib.status = 'active' 
                AND ib.deleted_at IS NULL
            LEFT JOIN units u ON inv.unit_id = u.id
            WHERE 
                inv.restaurant_id = ?
                AND inv.deleted_at IS NULL
            GROUP BY 
                inv.id
            HAVING 
                available_in_batches <= inv.threshold
            ORDER BY 
                shortage DESC
        `;

        const lowStockItems = await executeQuery(lowStockSql, [restaurantId], "getLowStockItems");

        // Get expiring batches
        const expiringBatches = await getExpiringBatchesModel(restaurantId, 3); // Next 3 days

        callBack(
            resultObject(true, "Kitchen inventory alerts retrieved successfully", {
                low_stock_items: lowStockItems,
                expiring_batches: expiringBatches,
                low_stock_count: lowStockItems.length,
                expiring_batches_count: expiringBatches.length,
            })
        );
    } catch (error) {
        console.error("Error in getKitchenInventoryAlerts:", error);
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

// Function to get order preparation details
const getOrderPreparationDetails = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (authorize?.department_id !== 6) {
            throw new CustomError("You don't have permission to view order details!", 403);
        }

        const { order_id } = request.params;

        if (!order_id) {
            throw new CustomError("Order ID is required", 400);
        }

        // const orderDetails = await getOrderWithIngredientDetailsModel(order_id);

        // // Get recipe details for each item
        // const itemsWithRecipes = await Promise.all(
        //     orderDetails.items.map(async (item) => {
        //         try {
        //             const recipe = await getRecipeWithAvailabilityModel(item.item_id);
        //             return {
        //                 ...item,
        //                 recipe: recipe.ingredients,
        //                 total_ingredients: recipe.ingredients.length,
        //                 available_ingredients: recipe.ingredients.filter((ing) => ing.sufficient_stock).length,
        //             };
        //         } catch (error) {
        //             return {
        //                 ...item,
        //                 recipe: [],
        //                 total_ingredients: 0,
        //                 available_ingredients: 0,
        //             };
        //         }
        //     })
        // );

        callBack(
            resultObject(true, "Order preparation details retrieved successfully", {
                ...orderDetails,
                items: itemsWithRecipes,
            })
        );
    } catch (error) {
        console.error("Error in getOrderPreparationDetails:", error);
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
    getPendingKitchenOrdersController,
    getInProgressKitchenOrdersController,
    startProcessingOrderController,
    completeOrderController,
    getLowInventoryItemsController,
    getKitchenOrderHistoryController,
};
