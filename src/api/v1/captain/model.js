// src/api/v1/captain/model.js (Expanded version)

const { executeQuery, executeTransaction, buildInsertQuery } = require("../../../helpers/db");
const { CustomError } = require("../../../middleware/errorHandler");

/**
 * Get all tables for a restaurant with their current status
 * @param {Object} req - Request object
 * @returns {Promise<Array>} - Array of tables with status
 */
const getRestaurantTablesModel = async (req) => {
    try {
        const { restaurant_id } = req.params;

        // Use restaurant_id from the authenticated user if not specified
        const actualRestaurantId = restaurant_id || req.user?.restaurant_id;

        if (!actualRestaurantId) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        const sql = `
            SELECT
                t.id,
                t.number as table_number,
                ts.id as status_id,
                ts.name as status_name,
                (
                    SELECT COUNT(*) FROM orders o 
                    WHERE o.table_id = t.id 
                    AND o.status_id IN (1, 2, 3) -- Pending, Captain Approved, In Kitchen
                ) as active_orders_count,
                (
                    SELECT COUNT(*) FROM captain_calls cc 
                    WHERE cc.table_id = t.id 
                    AND cc.status IN ('pending', 'in_progress')
                ) as active_calls_count
            FROM
                tables t
            LEFT JOIN
                table_statuses ts ON ts.id = t.status
            WHERE
                t.restaurant_id = ?
            AND
                t.deleted_at IS NULL
            ORDER BY 
                t.number ASC
        `;

        return await executeQuery(sql, [actualRestaurantId], "getRestaurantTablesModel");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Get all pending orders that need captain approval
 * @param {Object} req - Request object
 * @returns {Promise<Array>} - Array of pending orders
 */
const getPendingOrdersModel = async (req) => {
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
                            'special_instructions', oi.special_instructions
                        )
                    )
                    FROM order_items oi
                    JOIN items i ON oi.item_id = i.id
                    WHERE oi.order_id = o.id
                ) as items,
                o.special_request,
                o.status_id,
                os.name as status_name
            FROM 
                orders o
            JOIN 
                tables t ON o.table_id = t.id
            JOIN 
                order_statuses os ON o.status_id = os.id
            WHERE 
                o.restaurant_id = ?
            AND 
                o.status_id = 1 -- Pending status
            AND 
                o.deleted_at IS NULL
            ORDER BY 
                o.created_at ASC
        `;

        return await executeQuery(sql, [actualRestaurantId], "getPendingOrdersModel");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Get all active orders (approved by captain but not completed)
 * @param {Object} req - Request object
 * @returns {Promise<Array>} - Array of active orders
 */
const getActiveOrdersModel = async (req) => {
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
                            'special_instructions', oi.special_instructions
                        )
                    )
                    FROM order_items oi
                    JOIN items i ON oi.item_id = i.id
                    WHERE oi.order_id = o.id
                ) as items,
                o.special_request,
                o.status_id,
                os.name as status_name,
                o.updated_at as last_updated,
                o.estimated_ready_time
            FROM 
                orders o
            JOIN 
                tables t ON o.table_id = t.id
            JOIN 
                order_statuses os ON o.status_id = os.id
            WHERE 
                o.restaurant_id = ?
            AND 
                o.status_id IN (2, 3) -- Captain Approved, In Kitchen
            AND 
                o.deleted_at IS NULL
            ORDER BY 
                o.created_at ASC
        `;

        return await executeQuery(sql, [actualRestaurantId], "getActiveOrdersModel");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Update order status
 * @param {Object} data - Order data
 * @returns {Promise<Boolean>} - Success status
 */
const updateOrderStatusModel = async (data) => {
    try {
        const { order_id, status_id, user_id, notes } = data;

        // Start a transaction
        const queries = [];

        // Update order status
        queries.push({
            sql: `
                UPDATE orders
                SET status_id = ?, updated_by = ?, updated_at = NOW()
                WHERE id = ?
            `,
            params: [status_id, user_id, order_id],
        });

        // Record status change in history
        queries.push({
            sql: `
                INSERT INTO order_status_history
                (order_id, status_id, changed_by, notes, created_at)
                VALUES (?, ?, ?, ?, NOW())
            `,
            params: [order_id, status_id, user_id, notes],
        });

        // If moving to kitchen (status 3), set estimated ready time
        if (status_id === 3) {
            // Get total estimated preparation time for all items in order
            const prepTimeQuery = `
                SELECT SUM(i.preparation_time * oi.quantity) as total_prep_time
                FROM order_items oi
                JOIN items i ON oi.item_id = i.id
                WHERE oi.order_id = ?
            `;

            const prepTimeResult = await executeQuery(prepTimeQuery, [order_id], "getOrderPrepTime");
            const totalPrepMinutes = prepTimeResult[0]?.total_prep_time || 15; // Default 15 min if not specified

            // Calculate estimated ready time
            const readyTimeQuery = {
                sql: `
                    UPDATE orders
                    SET estimated_ready_time = DATE_ADD(NOW(), INTERVAL ? MINUTE)
                    WHERE id = ?
                `,
                params: [totalPrepMinutes, order_id],
            };

            queries.push(readyTimeQuery);
        }

        // If completed (status 4), record actual ready time
        if (status_id === 4) {
            queries.push({
                sql: `
                    UPDATE orders
                    SET actual_ready_time = NOW()
                    WHERE id = ?
                `,
                params: [order_id],
            });
        }

        await executeTransaction(queries, "updateOrderStatus");
        return true;
    } catch (error) {
        throw new CustomError(`Failed to update order status: ${error.message}`, 500);
    }
};

/**
 * Get pending captain calls
 * @param {Object} req - Request object
 * @returns {Promise<Array>} - Array of pending captain calls
 */
const getPendingCaptainCallsModel = async (req) => {
    try {
        const { restaurant_id } = req.params;

        // Use restaurant_id from the authenticated user if not specified
        const actualRestaurantId = restaurant_id || req.user?.restaurant_id;

        if (!actualRestaurantId) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        const sql = `
            SELECT 
                cc.id,
                cc.table_id,
                t.number as table_number,
                cc.status,
                cc.created_at,
                cc.updated_at,
                TIMESTAMPDIFF(MINUTE, cc.created_at, NOW()) as minutes_ago
            FROM 
                captain_calls cc
            JOIN 
                tables t ON cc.table_id = t.id
            WHERE 
                cc.restaurant_id = ?
            AND 
                cc.status IN ('pending', 'in_progress')
            ORDER BY 
                cc.created_at ASC
        `;

        return await executeQuery(sql, [actualRestaurantId], "getPendingCaptainCallsModel");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Update captain call status
 * @param {Object} data - Captain call data
 * @returns {Promise<Boolean>} - Success status
 */
const updateCaptainCallModel = async (data) => {
    try {
        const { call_id, status, user_id } = data;

        let updateSql = `
            UPDATE captain_calls
            SET status = ?, updated_at = NOW()
        `;

        const params = [status];

        // If completing or cancelling, record who did it
        if (status === "completed" || status === "cancelled") {
            updateSql += `, completed_at = NOW(), completed_by = ?`;
            params.push(user_id);
        }

        updateSql += ` WHERE id = ?`;
        params.push(call_id);

        await executeQuery(updateSql, params, "updateCaptainCallModel");
        return true;
    } catch (error) {
        throw new CustomError(`Failed to update captain call: ${error.message}`, 500);
    }
};

/**
 * Get tables with active orders statistics
 * @param {Object} req - Request object
 * @returns {Promise<Array>} - Array of tables with order statistics
 */
const getTablesWithOrdersStatsModel = async (req) => {
    try {
        const { restaurant_id } = req.params;

        // Use restaurant_id from the authenticated user if not specified
        const actualRestaurantId = restaurant_id || req.user?.restaurant_id;

        if (!actualRestaurantId) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        const sql = `
            SELECT
                t.id,
                t.number as table_number,
                ts.id as status_id,
                ts.name as status_name,
                (
                    SELECT COUNT(*) FROM orders o 
                    WHERE o.table_id = t.id 
                    AND o.status_id IN (1, 2, 3, 4) -- Active orders
                    AND DATE(o.created_at) = CURDATE()
                ) as today_orders_count,
                (
                    SELECT COALESCE(SUM(i.price * oi.quantity), 0)
                    FROM orders o 
                    JOIN order_items oi ON o.id = oi.order_id
                    JOIN items i ON oi.item_id = i.id
                    WHERE o.table_id = t.id 
                    AND DATE(o.created_at) = CURDATE()
                ) as today_total_sales,
                (
                    SELECT MAX(o.created_at)
                    FROM orders o 
                    WHERE o.table_id = t.id
                ) as last_order_time,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', o.id,
                            'status', os.name,
                            'items_count', (
                                SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id
                            ),
                            'created_at', o.created_at
                        )
                    )
                    FROM orders o
                    JOIN order_statuses os ON o.status_id = os.id
                    WHERE o.table_id = t.id
                    AND o.status_id IN (1, 2, 3, 4) -- Active orders
                    ORDER BY o.created_at DESC
                    LIMIT 5
                ) as recent_orders
            FROM
                tables t
            LEFT JOIN
                table_statuses ts ON ts.id = t.status
            WHERE
                t.restaurant_id = ?
            AND
                t.deleted_at IS NULL
            ORDER BY 
                today_orders_count DESC, t.number ASC
        `;

        return await executeQuery(sql, [actualRestaurantId], "getTablesWithOrdersStatsModel");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Create order directly for a table (bypassing cart system)
 * @param {Object} data - Order data
 * @returns {Promise<Object>} - Created order info
 */
const createOrderForTableModel = async (data) => {
    try {
        const { table_id, items, special_request, allergy_info, customer_name, created_by, restaurant_id } = data;

        // Validate table exists and belongs to restaurant
        const tableQuery = `
            SELECT id, number, restaurant_id
            FROM tables
            WHERE id = ? AND restaurant_id = ? AND deleted_at IS NULL
        `;

        const tableResult = await executeQuery(tableQuery, [table_id, restaurant_id], "validateTable");

        if (!tableResult || tableResult.length === 0) {
            throw new CustomError("Table not found or doesn't belong to this restaurant", 404);
        }

        const table = tableResult[0];

        // Validate all items exist and belong to restaurant
        const itemIds = items.map((item) => item.item_id);
        const itemsQuery = `
            SELECT id, name, price, restaurant_id
            FROM items
            WHERE id IN (${itemIds.map(() => "?").join(",")}) 
            AND restaurant_id = ? 
            AND deleted_at IS NULL
        `;

        const itemsResult = await executeQuery(itemsQuery, [...itemIds, restaurant_id], "validateItems");

        if (!itemsResult || itemsResult.length !== itemIds.length) {
            throw new CustomError("One or more items not found or don't belong to this restaurant", 404);
        }

        // Create a map for quick item lookup
        const itemsMap = {};
        itemsResult.forEach((item) => {
            itemsMap[item.id] = item;
        });

        // Start transaction for order creation
        const queries = [];

        // Create main order
        queries.push({
            sql: `
                INSERT INTO orders (
                    restaurant_id,
                    table_id,
                    status_id,
                    special_request,
                    allergy_info,
                    customer_name,
                    created_by,
                    created_at
                ) VALUES (?, ?, 1, ?, ?, ?, ?, NOW())
            `,
            params: [restaurant_id, table_id, special_request, allergy_info, customer_name, created_by],
        });

        // Add order items
        items.forEach((item) => {
            queries.push({
                sql: `
                    INSERT INTO order_items (
                        order_id,
                        item_id,
                        quantity,
                        special_instructions,
                        created_at
                    ) VALUES (LAST_INSERT_ID(), ?, ?, ?, NOW())
                `,
                params: [item.item_id, item.quantity, item.special_instructions || null],
            });
        });

        // Record order status history
        queries.push({
            sql: `
                INSERT INTO order_status_history
                (order_id, status_id, changed_by, notes, created_at)
                VALUES (LAST_INSERT_ID(), 1, ?, 'Order created by captain', NOW())
            `,
            params: [created_by],
        });

        // Execute transaction
        const results = await executeTransaction(queries, "createOrderForTable");
        const orderId = results[0].insertId;

        // Calculate total for response
        let totalAmount = 0;
        items.forEach((item) => {
            const itemInfo = itemsMap[item.item_id];
            if (itemInfo) {
                totalAmount += itemInfo.price * item.quantity;
            }
        });

        return {
            order_id: orderId,
            table_number: table.number,
            total_amount: totalAmount,
            items_count: items.length,
        };
    } catch (error) {
        if (error instanceof CustomError) {
            throw error;
        }
        throw new CustomError(`Failed to create order: ${error.message}`, 500);
    }
};

/**
 * Get menu items available for ordering
 * @param {number} restaurant_id - Restaurant ID
 * @returns {Promise<Array>} - Menu items organized by categories
 */
const getMenuForOrderingModel = async (restaurant_id) => {
    try {
        if (!restaurant_id) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        const sql = `
            SELECT 
                c.id as category_id,
                c.name as category_name,
                c.image_url as category_image,
                sc.id as sub_category_id,
                sc.name as sub_category_name,
                sc.image_url as sub_category_image,
                i.id as item_id,
                i.name as item_name,
                i.description as item_description,
                i.price as item_price,
                i.is_shisha,
                cur.code as currency_code,
                img.url as item_image
            FROM 
                categories c
            LEFT JOIN 
                sub_categories sc ON c.id = sc.category_id
            LEFT JOIN 
                items i ON sc.id = i.sub_category_id AND i.deleted_at IS NULL
            LEFT JOIN
                currencies cur ON i.currency_id = cur.id
            LEFT JOIN
                items_image_map iim ON i.id = iim.item_id AND iim.is_primary = 1
            LEFT JOIN
                images img ON iim.image_id = img.id
            WHERE 
                c.restaurant_id = ?
            AND 
                c.deleted_at IS NULL
            AND 
                (sc.deleted_at IS NULL OR sc.id IS NULL)
            ORDER BY 
                c.name, sc.name, i.name
        `;

        const result = await executeQuery(sql, [restaurant_id], "getMenuForOrdering");

        // Organize data by categories and subcategories
        const menuStructure = {};

        result.forEach((row) => {
            // Initialize category if it doesn't exist
            if (!menuStructure[row.category_id]) {
                menuStructure[row.category_id] = {
                    id: row.category_id,
                    name: row.category_name,
                    image: row.category_image,
                    sub_categories: {},
                };
            }

            // Skip if no subcategory (shouldn't happen in well-formed data)
            if (!row.sub_category_id) return;

            // Initialize subcategory if it doesn't exist
            if (!menuStructure[row.category_id].sub_categories[row.sub_category_id]) {
                menuStructure[row.category_id].sub_categories[row.sub_category_id] = {
                    id: row.sub_category_id,
                    name: row.sub_category_name,
                    image: row.sub_category_image,
                    items: [],
                };
            }

            // Add item if it exists
            if (row.item_id) {
                menuStructure[row.category_id].sub_categories[row.sub_category_id].items.push({
                    id: row.item_id,
                    name: row.item_name,
                    description: row.item_description,
                    price: row.item_price,
                    currency: row.currency_code,
                    is_shisha: row.is_shisha,
                    image: row.item_image,
                });
            }
        });

        // Convert to array format for easier frontend consumption
        const menuArray = Object.values(menuStructure).map((category) => ({
            ...category,
            sub_categories: Object.values(category.sub_categories),
        }));

        return menuArray;
    } catch (error) {
        if (error instanceof CustomError) {
            throw error;
        }
        throw new CustomError(`Failed to get menu: ${error.message}`, 500);
    }
};

module.exports = {
    getRestaurantTablesModel,
    getPendingOrdersModel,
    getActiveOrdersModel,
    updateOrderStatusModel,
    getPendingCaptainCallsModel,
    updateCaptainCallModel,
    getTablesWithOrdersStatsModel,
    createOrderForTableModel,      // Add this
    getMenuForOrderingModel        // Add this
};
