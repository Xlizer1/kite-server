const { executeQuery, executeTransaction } = require("../../../helpers/db");
const { CustomError } = require("../../../middleware/errorHandler");

/**
 * Get pending kitchen orders
 * @param {Object} req - Request object
 * @returns {Promise<Array>} - Array of pending kitchen orders
 */
const getPendingKitchenOrdersModel = async (req) => {
    try {
        const { restaurant_id } = req.params;

        // Use restaurant_id from the authenticated user if not specified
        const actualRestaurantId = restaurant_id || req.user?.restaurant_id;

        if (!actualRestaurantId) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        const sql = `
            SELECT 
                o.id as order_id,
                o.created_at,
                o.updated_at as last_updated,
                t.number as table_number,
                t.id as table_id,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', oi.id,
                            'item_id', oi.item_id,
                            'item_name', i.name,
                            'quantity', oi.quantity,
                            'price', i.price,
                            'special_instructions', oi.special_instructions,
                            'preparation_time', i.preparation_time,
                            'is_vegetarian', i.is_vegetarian,
                            'allergens', i.allergens
                        )
                    )
                    FROM order_items oi
                    JOIN items i ON oi.item_id = i.id
                    WHERE oi.order_id = o.id
                ) as items,
                o.special_request,
                o.allergy_info,
                o.preparation_notes,
                u.name as approved_by,
                o.estimated_ready_time,
                TIMESTAMPDIFF(MINUTE, NOW(), o.estimated_ready_time) as minutes_remaining,
                CASE
                    WHEN o.estimated_ready_time < NOW() THEN 'overdue'
                    WHEN TIMESTAMPDIFF(MINUTE, NOW(), o.estimated_ready_time) <= 5 THEN 'urgent'
                    ELSE 'normal'
                END as priority
            FROM 
                orders o
            JOIN 
                tables t ON o.table_id = t.id
            LEFT JOIN 
                users u ON o.updated_by = u.id
            WHERE 
                o.restaurant_id = ?
            AND 
                o.status_id = 2 -- Orders approved by captain, ready for kitchen
            AND 
                o.deleted_at IS NULL
            ORDER BY 
                priority ASC, o.created_at ASC
        `;

        return await executeQuery(sql, [actualRestaurantId], "getPendingKitchenOrdersModel");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Get in-progress kitchen orders
 * @param {Object} req - Request object
 * @returns {Promise<Array>} - Array of in-progress kitchen orders
 */
const getInProgressKitchenOrdersModel = async (req) => {
    try {
        const { restaurant_id } = req.params;

        // Use restaurant_id from the authenticated user if not specified
        const actualRestaurantId = restaurant_id || req.user?.restaurant_id;

        if (!actualRestaurantId) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        const sql = `
            SELECT 
                o.id as order_id,
                o.created_at,
                o.updated_at as last_updated,
                t.number as table_number,
                t.id as table_id,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', oi.id,
                            'item_id', oi.item_id,
                            'item_name', i.name,
                            'quantity', oi.quantity,
                            'price', i.price,
                            'special_instructions', oi.special_instructions,
                            'preparation_time', i.preparation_time
                        )
                    )
                    FROM order_items oi
                    JOIN items i ON oi.item_id = i.id
                    WHERE oi.order_id = o.id
                ) as items,
                o.special_request,
                o.preparation_notes,
                (
                    SELECT u.name
                    FROM kitchen_assignments ka
                    JOIN users u ON ka.assigned_to = u.id
                    WHERE ka.order_id = o.id
                    ORDER BY ka.assigned_at DESC
                    LIMIT 1
                ) as assigned_to,
                o.estimated_ready_time,
                TIMESTAMPDIFF(MINUTE, NOW(), o.estimated_ready_time) as minutes_remaining,
                CASE
                    WHEN o.estimated_ready_time < NOW() THEN 'overdue'
                    WHEN TIMESTAMPDIFF(MINUTE, NOW(), o.estimated_ready_time) <= 5 THEN 'urgent'
                    ELSE 'normal'
                END as priority
            FROM 
                orders o
            JOIN 
                tables t ON o.table_id = t.id
            WHERE 
                o.restaurant_id = ?
            AND 
                o.status_id = 3 -- Orders in kitchen
            AND 
                o.deleted_at IS NULL
            ORDER BY 
                priority ASC, o.created_at ASC
        `;

        return await executeQuery(sql, [actualRestaurantId], "getInProgressKitchenOrdersModel");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Start processing an order in the kitchen
 * @param {Object} data - Data object containing order_id and user_id
 * @returns {Promise<Boolean>} - Success status
 */
const startProcessingOrderModel = async (data) => {
    try {
        const { order_id, user_id, estimated_minutes } = data;

        // Start transaction
        const queries = [];

        // Update order status to "In Kitchen" (3)
        queries.push({
            sql: `
                UPDATE orders
                SET status_id = 3, updated_by = ?, updated_at = NOW()
                WHERE id = ?
            `,
            params: [user_id, order_id],
        });

        // Record status change in history
        queries.push({
            sql: `
                INSERT INTO order_status_history
                (order_id, status_id, changed_by, notes, created_at)
                VALUES (?, 3, ?, 'Started processing in kitchen', NOW())
            `,
            params: [order_id, user_id],
        });

        // Create kitchen assignment
        queries.push({
            sql: `
                INSERT INTO kitchen_assignments
                (order_id, assigned_to, assigned_by, assigned_at, estimated_completion)
                VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? MINUTE))
            `,
            params: [order_id, user_id, user_id, estimated_minutes || 20],
        });

        // Update estimated ready time if provided
        if (estimated_minutes) {
            queries.push({
                sql: `
                    UPDATE orders
                    SET estimated_ready_time = DATE_ADD(NOW(), INTERVAL ? MINUTE)
                    WHERE id = ?
                `,
                params: [estimated_minutes, order_id],
            });
        }

        // ========================================
        // 🔄 NEW: FIFO BATCH CONSUMPTION SYSTEM
        // ========================================

        // Get all items and their quantities in the order
        const orderItemsQuery = `
            SELECT oi.item_id, oi.quantity, i.name as item_name
            FROM order_items oi
            JOIN items i ON oi.item_id = i.id
            WHERE oi.order_id = ?
        `;

        const orderItems = await executeQuery(orderItemsQuery, [order_id], "getOrderItems");

        // For each item, get ingredients and consume from batches using FIFO
        for (const item of orderItems) {
            // Get all ingredients for this menu item
            const ingredientsQuery = `
                SELECT 
                    ing.inv_item_id, 
                    ing.quantity as recipe_quantity,
                    inv.name as ingredient_name
                FROM ingredients ing
                JOIN inventory inv ON ing.inv_item_id = inv.id
                WHERE ing.menu_item_id = ? AND ing.deleted_at IS NULL
            `;

            const ingredients = await executeQuery(ingredientsQuery, [item.item_id], "getItemIngredients");

            // Process each ingredient with FIFO batch consumption
            for (const ingredient of ingredients) {
                const totalQuantityNeeded = ingredient.recipe_quantity * item.quantity;

                console.log(
                    `🍳 Processing ${item.item_name}: Need ${totalQuantityNeeded} ${ingredient.ingredient_name}`
                );

                try {
                    // ✅ Use FIFO batch consumption instead of simple inventory update
                    const { consumeFromBatchesModel } = require("../inventory-batches/model");

                    const consumptionResult = await consumeFromBatchesModel(
                        ingredient.inv_item_id,
                        totalQuantityNeeded,
                        "order",
                        order_id,
                        user_id
                    );

                    console.log(
                        `✅ Consumed ${totalQuantityNeeded} ${ingredient.ingredient_name} from ${consumptionResult.batches_affected.length} batches:`
                    );
                    consumptionResult.batches_affected.forEach((batch) => {
                        console.log(`   - Batch ${batch.batch_number}: ${batch.consumed_quantity}`);
                    });

                    // Record detailed consumption log
                    queries.push({
                        sql: `
                            INSERT INTO order_ingredient_consumption
                            (order_id, item_id, inventory_id, quantity_consumed, batches_used, created_by, created_at)
                            VALUES (?, ?, ?, ?, ?, ?, NOW())
                        `,
                        params: [
                            order_id,
                            item.item_id,
                            ingredient.inv_item_id,
                            totalQuantityNeeded,
                            JSON.stringify(consumptionResult.batches_affected),
                            user_id,
                        ],
                    });
                } catch (consumptionError) {
                    // Handle insufficient stock errors
                    if (consumptionError.message && consumptionError.message.includes("Insufficient stock")) {
                        throw new CustomError(
                            `Cannot prepare ${item.item_name}: Insufficient ${ingredient.ingredient_name}. ${consumptionError.message}`,
                            400
                        );
                    }
                    throw consumptionError;
                }
            }
        }

        // Execute all queries in transaction
        await executeTransaction(queries, "startProcessingOrderWithBatches");

        console.log(`🎯 Order ${order_id} started processing with FIFO batch consumption`);
        return true;
    } catch (error) {
        console.error(`❌ Failed to start processing order ${order_id}:`, error);
        throw new CustomError(`Failed to start processing order: ${error.message}`, 500);
    }
};

/**
 * Complete an order in the kitchen
 * @param {Object} data - Data object containing order_id and user_id
 * @returns {Promise<Boolean>} - Success status
 */
const completeOrderModel = async (data) => {
    try {
        const { order_id, user_id, notes } = data;

        // Start a transaction
        const queries = [];

        // Update order status to "Ready" (4)
        queries.push({
            sql: `
                UPDATE orders
                SET status_id = 4, updated_by = ?, updated_at = NOW(), actual_ready_time = NOW()
                WHERE id = ?
            `,
            params: [user_id, order_id],
        });

        // Record status change in history
        queries.push({
            sql: `
                INSERT INTO order_status_history
                (order_id, status_id, changed_by, notes, created_at)
                VALUES (?, 4, ?, ?, NOW())
            `,
            params: [order_id, user_id, notes || "Completed in kitchen"],
        });

        // Update kitchen assignment
        queries.push({
            sql: `
                UPDATE kitchen_assignments
                SET completed_at = NOW()
                WHERE order_id = ? AND completed_at IS NULL
            `,
            params: [order_id],
        });

        await executeTransaction(queries, "completeOrder");
        return true;
    } catch (error) {
        throw new CustomError(`Failed to complete order: ${error.message}`, 500);
    }
};

/**
 * Get low inventory items
 * @param {Object} req - Request object
 * @returns {Promise<Array>} - Array of low inventory items
 */
const getLowInventoryItemsModel = async (req) => {
    try {
        const { restaurant_id } = req.params;

        // Use restaurant_id from the authenticated user if not specified
        const actualRestaurantId = restaurant_id || req.user?.restaurant_id;

        if (!actualRestaurantId) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        const sql = `
            SELECT 
                i.id,
                i.name,
                i.quantity,
                u.name as unit_name,
                i.threshold,
                CASE
                    WHEN i.quantity = 0 THEN 'out_of_stock'
                    WHEN i.quantity <= i.threshold * 0.5 THEN 'critical'
                    WHEN i.quantity <= i.threshold THEN 'low'
                    ELSE 'normal'
                END as stock_status,
                i.price,
                c.code as currency_code
            FROM 
                inventory i
            JOIN
                units u ON i.unit_id = u.id
            JOIN
                currencies c ON i.currency_id = c.id
            WHERE 
                i.restaurant_id = ?
            AND 
                i.quantity <= i.threshold
            AND 
                i.deleted_at IS NULL
            ORDER BY 
                stock_status ASC, i.quantity ASC
        `;

        return await executeQuery(sql, [actualRestaurantId], "getLowInventoryItemsModel");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Get kitchen order history
 * @param {Object} req - Request object
 * @returns {Promise<Array>} - Array of completed kitchen orders
 */
const getKitchenOrderHistoryModel = async (req) => {
    try {
        const { restaurant_id, date, limit } = req.query;

        // Use restaurant_id from the authenticated user if not specified
        const actualRestaurantId = restaurant_id || req.user?.restaurant_id;
        const actualDate = date || new Date().toISOString().split("T")[0]; // Today if not specified
        const actualLimit = limit || 20;

        if (!actualRestaurantId) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        const sql = `
            SELECT 
                o.id as order_id,
                o.created_at,
                o.actual_ready_time,
                TIMESTAMPDIFF(MINUTE, o.created_at, o.actual_ready_time) as preparation_minutes,
                t.number as table_number,
                (
                    SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id
                ) as total_items,
                (
                    SELECT u.name
                    FROM order_status_history osh
                    JOIN users u ON osh.changed_by = u.id
                    WHERE osh.order_id = o.id AND osh.status_id = 4 -- Ready status
                    ORDER BY osh.created_at DESC
                    LIMIT 1
                ) as completed_by
            FROM 
                orders o
            JOIN 
                tables t ON o.table_id = t.id
            WHERE 
                o.restaurant_id = ?
            AND 
                o.status_id >= 4 -- Ready or beyond
            AND 
                DATE(o.actual_ready_time) = ?
            AND 
                o.deleted_at IS NULL
            ORDER BY 
                o.actual_ready_time DESC
            LIMIT ?
        `;

        return await executeQuery(
            sql,
            [actualRestaurantId, actualDate, parseInt(actualLimit)],
            "getKitchenOrderHistoryModel"
        );
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const validateOrderIngredientsAvailability = async (order_id) => {
    try {
        const orderItemsQuery = `
            SELECT oi.item_id, oi.quantity, i.name as item_name
            FROM order_items oi
            JOIN items i ON oi.item_id = i.id
            WHERE oi.order_id = ?
        `;

        const orderItems = await executeQuery(orderItemsQuery, [order_id], "getOrderItemsValidation");
        const validationResults = [];

        for (const item of orderItems) {
            // Get recipe requirements
            const ingredientsQuery = `
                SELECT 
                    ing.inv_item_id, 
                    ing.quantity as recipe_quantity,
                    inv.name as ingredient_name
                FROM ingredients ing
                JOIN inventory inv ON ing.inv_item_id = inv.id
                WHERE ing.menu_item_id = ? AND ing.deleted_at IS NULL
            `;

            const ingredients = await executeQuery(ingredientsQuery, [item.item_id], "getRecipeIngredients");

            for (const ingredient of ingredients) {
                const totalQuantityNeeded = ingredient.recipe_quantity * item.quantity;

                // Check batch availability
                const batchAvailabilityQuery = `
                    SELECT 
                        SUM(current_quantity) as total_available
                    FROM inventory_batches 
                    WHERE inventory_id = ? 
                    AND current_quantity > 0 
                    AND status = 'active'
                    AND deleted_at IS NULL
                `;

                const availabilityResult = await executeQuery(
                    batchAvailabilityQuery,
                    [ingredient.inv_item_id],
                    "checkBatchAvailability"
                );

                const available = availabilityResult[0]?.total_available || 0;

                if (available < totalQuantityNeeded) {
                    validationResults.push({
                        item_name: item.item_name,
                        ingredient_name: ingredient.ingredient_name,
                        required: totalQuantityNeeded,
                        available: available,
                        shortage: totalQuantityNeeded - available,
                    });
                }
            }
        }

        return {
            canPrepare: validationResults.length === 0,
            shortages: validationResults,
        };
    } catch (error) {
        throw new CustomError(`Failed to validate ingredients: ${error.message}`, 500);
    }
};

module.exports = {
    getPendingKitchenOrdersModel,
    getInProgressKitchenOrdersModel,
    startProcessingOrderModel,
    validateOrderIngredientsAvailability,
    completeOrderModel,
    getLowInventoryItemsModel,
    getKitchenOrderHistoryModel,
};
