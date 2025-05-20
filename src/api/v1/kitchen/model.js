// src/api/v1/kitchen/model.js

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

        // Start a transaction
        const queries = [];
        
        // Update order status to "In Kitchen" (3)
        queries.push({
            sql: `
                UPDATE orders
                SET status_id = 3, updated_by = ?, updated_at = NOW()
                WHERE id = ?
            `,
            params: [user_id, order_id]
        });
        
        // Record status change in history
        queries.push({
            sql: `
                INSERT INTO order_status_history
                (order_id, status_id, changed_by, notes, created_at)
                VALUES (?, 3, ?, 'Started processing in kitchen', NOW())
            `,
            params: [order_id, user_id]
        });
        
        // Create kitchen assignment
        queries.push({
            sql: `
                INSERT INTO kitchen_assignments
                (order_id, assigned_to, assigned_by, assigned_at, estimated_completion)
                VALUES (?, ?, ?, NOW(), DATE_ADD(NOW(), INTERVAL ? MINUTE))
            `,
            params: [order_id, user_id, user_id, estimated_minutes || 20]
        });
        
        // Update estimated ready time if provided
        if (estimated_minutes) {
            queries.push({
                sql: `
                    UPDATE orders
                    SET estimated_ready_time = DATE_ADD(NOW(), INTERVAL ? MINUTE)
                    WHERE id = ?
                `,
                params: [estimated_minutes, order_id]
            });
        }
        
        // Process inventory deductions for all items in the order
        // First, get all items and their quantities in the order
        const orderItemsQuery = `
            SELECT oi.item_id, oi.quantity
            FROM order_items oi
            WHERE oi.order_id = ?
        `;
        
        const orderItems = await executeQuery(orderItemsQuery, [order_id], "getOrderItems");
        
        // For each item, get ingredients and deduct from inventory
        for (const item of orderItems) {
            // Get all ingredients for this menu item
            const ingredientsQuery = `
                SELECT ing.inv_item_id, ing.quantity
                FROM ingredients ing
                WHERE ing.menu_item_id = ?
            `;
            
            const ingredients = await executeQuery(ingredientsQuery, [item.item_id], "getItemIngredients");
            
            // Deduct each ingredient from inventory based on quantity
            for (const ingredient of ingredients) {
                const totalQuantityNeeded = ingredient.quantity * item.quantity;
                
                // Deduct from inventory
                queries.push({
                    sql: `
                        UPDATE inventory
                        SET quantity = quantity - ?, updated_at = NOW(), updated_by = ?
                        WHERE id = ?
                    `,
                    params: [totalQuantityNeeded, user_id, ingredient.inv_item_id]
                });
                
                // Record stock movement
                queries.push({
                    sql: `
                        INSERT INTO stock_movements
                        (item_id, movement_type_id, reference_id, quantity, created_by, notes)
                        VALUES (?, 2, ?, ?, ?, CONCAT('Used in order #', ?))
                    `,
                    params: [ingredient.inv_item_id, 2, order_id, totalQuantityNeeded, user_id, order_id]
                });
                
                // Check if inventory falls below threshold and create notification if needed
                queries.push({
                    sql: `
                        INSERT INTO inventory_notifications 
                        (inventory_id, notification_type, message, created_at)
                        SELECT 
                            id, 'low_stock', 
                            CONCAT('Inventory item ', name, ' has fallen below threshold. Current quantity: ', 
                                quantity - ?, ', Threshold: ', threshold),
                            NOW()
                        FROM inventory
                        WHERE id = ? AND (quantity - ?) <= threshold AND threshold > 0
                    `,
                    params: [totalQuantityNeeded, ingredient.inv_item_id, totalQuantityNeeded]
                });
            }
        }
        
        await executeTransaction(queries, "startProcessingOrder");
        return true;
    } catch (error) {
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
            params: [user_id, order_id]
        });
        
        // Record status change in history
        queries.push({
            sql: `
                INSERT INTO order_status_history
                (order_id, status_id, changed_by, notes, created_at)
                VALUES (?, 4, ?, ?, NOW())
            `,
            params: [order_id, user_id, notes || 'Completed in kitchen']
        });
        
        // Update kitchen assignment
        queries.push({
            sql: `
                UPDATE kitchen_assignments
                SET completed_at = NOW()
                WHERE order_id = ? AND completed_at IS NULL
            `,
            params: [order_id]
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
        const actualDate = date || new Date().toISOString().split('T')[0]; // Today if not specified
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

        return await executeQuery(sql, [actualRestaurantId, actualDate, parseInt(actualLimit)], "getKitchenOrderHistoryModel");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

module.exports = {
    getPendingKitchenOrdersModel,
    getInProgressKitchenOrdersModel,
    startProcessingOrderModel,
    completeOrderModel,
    getLowInventoryItemsModel,
    getKitchenOrderHistoryModel
};