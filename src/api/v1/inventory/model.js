const { executeQuery, executeTransaction, buildInsertQuery, buildUpdateQuery } = require("../../../helpers/db");
const { DatabaseError, NotFoundError, ConflictError, BusinessLogicError } = require("../../../middleware/errorHandler");

const getInventoryItems = async () => {
    try {
        const sql = `
            SELECT
                i.id,
                i.restaurant_id,
                i.name,
                i.quantity,
                u.name AS unit_name,
                i.threshold,
                i.price,
                c.code AS currency_code,
                CASE 
                    WHEN i.quantity <= i.threshold THEN true 
                    ELSE false 
                END AS low_stock,
                i.created_at,
                i.updated_at,
                CONCAT(u_created.name, ' (', u_created.email, ')') as created_by_user,
                CONCAT(u_updated.name, ' (', u_updated.email, ')') as updated_by_user
            FROM
                inventory i
            LEFT JOIN
                units u ON i.unit_id = u.id
            LEFT JOIN
                currencies c ON i.currency_id = c.id
            LEFT JOIN
                users u_created ON i.created_by = u_created.id
            LEFT JOIN
                users u_updated ON i.updated_by = u_updated.id
            WHERE
                i.deleted_at IS NULL
            ORDER BY
                i.restaurant_id, i.name
        `;

        return await executeQuery(sql, [], "getInventoryItems");
    } catch (error) {
        throw new DatabaseError("Failed to fetch inventory items", error);
    }
};

const getInventoryItemsByRestaurantID = async (restaurant_id) => {
    try {
        const sql = `
            SELECT
                i.id,
                i.restaurant_id,
                i.name,
                i.quantity,
                u.name AS unit_name,
                i.threshold,
                i.price,
                c.code AS currency_code,
                CASE 
                    WHEN i.quantity <= i.threshold THEN true 
                    ELSE false 
                END AS low_stock,
                i.created_at,
                i.updated_at,
                CONCAT(u_created.name, ' (', u_created.email, ')') as created_by_user,
                CONCAT(u_updated.name, ' (', u_updated.email, ')') as updated_by_user
            FROM
                inventory i
            LEFT JOIN
                units u ON i.unit_id = u.id
            LEFT JOIN
                currencies c ON i.currency_id = c.id
            LEFT JOIN
                users u_created ON i.created_by = u_created.id
            LEFT JOIN
                users u_updated ON i.updated_by = u_updated.id
            WHERE
                i.restaurant_id = ?
            AND
                i.deleted_at IS NULL
            ORDER BY
                i.name
        `;

        const result = await executeQuery(sql, [restaurant_id], "getInventoryItemsByRestaurantID");
        if (!result.length) {
            throw new NotFoundError("No inventory items found for this restaurant");
        }
        return result;
    } catch (error) {
        if (error instanceof NotFoundError) throw error;
        throw new DatabaseError("Failed to fetch inventory items", error);
    }
};

const getLowStockItems = async (restaurant_id) => {
    try {
        const sql = `
            SELECT
                i.id,
                i.restaurant_id,
                i.name,
                i.quantity,
                u.name AS unit_name,
                i.threshold,
                i.price,
                c.code AS currency_code,
                (i.threshold - i.quantity) as quantity_needed
            FROM
                inventory i
            LEFT JOIN
                units u ON i.unit_id = u.id
            LEFT JOIN
                currencies c ON i.currency_id = c.id
            WHERE
                i.restaurant_id = ?
            AND
                i.quantity <= i.threshold
            AND
                i.deleted_at IS NULL
            ORDER BY
                (i.threshold - i.quantity) DESC
        `;

        const result = await executeQuery(sql, [restaurant_id], "getLowStockItems");
        if (!result.length) {
            throw new NotFoundError("No low stock items found for this restaurant");
        }
        return result;
    } catch (error) {
        if (error instanceof NotFoundError) throw error;
        throw new DatabaseError("Failed to fetch low stock items", error);
    }
};

const createInventoryItem = async (itemData) => {
    try {
        const { restaurant_id, name, quantity, unit_id, threshold, price, currency_id, created_by } = itemData;

        // Validate if unit exists
        const unitCheckSql = `SELECT id FROM units WHERE id = ? AND deleted_at IS NULL`;
        const unitResult = await executeQuery(unitCheckSql, [unit_id], "checkUnit");
        if (!unitResult.length) {
            throw new BusinessLogicError("Invalid unit specified");
        }

        // Validate if currency exists
        const currencyCheckSql = `SELECT id FROM currencies WHERE id = ? AND deleted_at IS NULL`;
        const currencyResult = await executeQuery(currencyCheckSql, [currency_id], "checkCurrency");
        if (!currencyResult.length) {
            throw new BusinessLogicError("Invalid currency specified");
        }

        // Check for duplicate item name in the same restaurant
        const duplicateCheckSql = `
            SELECT id FROM inventory 
            WHERE restaurant_id = ? AND name = ? AND deleted_at IS NULL
        `;
        const duplicateResult = await executeQuery(duplicateCheckSql, [restaurant_id, name], "checkDuplicate");
        if (duplicateResult.length) {
            throw new ConflictError("An item with this name already exists in this restaurant");
        }

        // Create inventory item and its first history record
        const queries = [];

        // Add inventory insert query
        const inventoryQuery = buildInsertQuery("inventory", {
            restaurant_id,
            name,
            quantity,
            unit_id,
            threshold,
            price,
            currency_id,
            created_by,
            created_at: new Date(),
        });
        queries.push(inventoryQuery);

        // Add inventory history insert query
        queries.push({
            sql: `
                INSERT INTO inventory_history (
                    inventory_id, quantity_change, new_quantity, 
                    action_type, created_by, created_at
                )
                VALUES (LAST_INSERT_ID(), ?, ?, 'initial', ?, NOW())
            `,
            params: [quantity, quantity, created_by],
        });

        // Execute transaction
        await executeTransaction(queries, "createInventoryItem");
        return true;
    } catch (error) {
        if (error instanceof ConflictError || error instanceof BusinessLogicError) {
            throw error;
        }
        throw new DatabaseError("Failed to create inventory item", error);
    }
};

const updateInventoryItem = async (id, itemData) => {
    try {
        const { name, quantity, unit_id, threshold, price, currency_id, updated_by } = itemData;

        // Check if item exists
        const checkSql = `
            SELECT quantity FROM inventory 
            WHERE id = ? AND deleted_at IS NULL
        `;
        const checkResult = await executeQuery(checkSql, [id], "checkInventoryItem");
        if (!checkResult.length) {
            throw new NotFoundError("Inventory item not found");
        }

        const oldQuantity = checkResult[0].quantity;

        // Start transaction for update
        const queries = [];

        // Add inventory update query
        const updateQuery = buildUpdateQuery(
            "inventory",
            {
                name,
                quantity,
                unit_id,
                threshold,
                price,
                currency_id,
                updated_by,
                updated_at: new Date(),
            },
            { id }
        );
        queries.push(updateQuery);

        // Add history record if quantity changed
        if (quantity !== oldQuantity) {
            const quantityChange = quantity - oldQuantity;
            queries.push({
                sql: `
                    INSERT INTO inventory_history (
                        inventory_id, quantity_change, new_quantity, 
                        action_type, created_by, created_at
                    )
                    VALUES (?, ?, ?, ?, ?, NOW())
                `,
                params: [id, quantityChange, quantity, "update", updated_by],
            });
        }

        // Execute transaction
        await executeTransaction(queries, "updateInventoryItem");
        return true;
    } catch (error) {
        if (error instanceof NotFoundError) throw error;
        throw new DatabaseError("Failed to update inventory item", error);
    }
};

const deleteInventoryItem = async (id, user_id) => {
    try {
        const sql = `
            UPDATE inventory 
            SET 
                deleted_at = NOW(),
                deleted_by = ?
            WHERE 
                id = ?
            AND 
                deleted_at IS NULL
        `;

        const result = await executeQuery(sql, [user_id, id], "deleteInventoryItem");
        if (result.affectedRows === 0) {
            throw new NotFoundError("Inventory item not found");
        }
        return true;
    } catch (error) {
        if (error instanceof NotFoundError) throw error;
        throw new DatabaseError("Failed to delete inventory item", error);
    }
};

const getInventoryHistory = async (inventory_id) => {
    try {
        const sql = `
            SELECT
                ih.id,
                ih.inventory_id,
                ih.quantity_change,
                ih.new_quantity,
                ih.action_type,
                ih.created_at,
                CONCAT(u.name, ' (', u.email, ')') as created_by_user
            FROM
                inventory_history ih
            LEFT JOIN
                users u ON ih.created_by = u.id
            WHERE
                ih.inventory_id = ?
            ORDER BY
                ih.created_at DESC
        `;

        return await executeQuery(sql, [inventory_id], "getInventoryHistory");
    } catch (error) {
        throw new DatabaseError("Failed to fetch inventory history", error);
    }
};

const checkStockAvailability = async (inventoryId, requiredQuantity) => {
    try {
        const sql = `
            SELECT 
                inv.id,
                inv.name,
                inv.quantity AS total_quantity,
                COALESCE(SUM(ib.current_quantity), 0) AS available_in_batches,
                CASE 
                    WHEN COALESCE(SUM(ib.current_quantity), 0) >= ? THEN true 
                    ELSE false 
                END AS sufficient_stock
            FROM 
                inventory inv
            LEFT JOIN inventory_batches ib ON inv.id = ib.inventory_id 
                AND ib.status = 'active' 
                AND ib.current_quantity > 0
                AND ib.deleted_at IS NULL
            WHERE 
                inv.id = ? 
                AND inv.deleted_at IS NULL
            GROUP BY 
                inv.id, inv.name, inv.quantity
        `;

        const result = await executeQuery(sql, [requiredQuantity, inventoryId], "checkStockAvailability");
        return result[0] || null;
    } catch (error) {
        throw new DatabaseError("Failed to check stock availability", error);
    }
};

// Add this function to get inventory with batch summary
const getInventoryWithBatches = async (inventoryId) => {
    try {
        const sql = `
            SELECT 
                inv.id,
                inv.restaurant_id,
                inv.name,
                inv.quantity AS total_quantity,
                inv.threshold,
                inv.price,
                c.code AS currency_code,
                u.name AS unit_name,
                u.unit_symbol,
                COUNT(ib.id) AS total_batches,
                COUNT(CASE WHEN ib.status = 'active' THEN 1 END) AS active_batches,
                COALESCE(SUM(CASE WHEN ib.status = 'active' THEN ib.current_quantity ELSE 0 END), 0) AS available_quantity,
                COALESCE(SUM(CASE WHEN ib.expiry_date < CURDATE() THEN ib.current_quantity ELSE 0 END), 0) AS expired_quantity,
                MIN(CASE WHEN ib.status = 'active' AND ib.expiry_date > CURDATE() THEN ib.expiry_date END) AS next_expiry_date,
                AVG(CASE WHEN ib.status = 'active' THEN ib.purchase_price END) AS avg_purchase_price,
                AVG(CASE WHEN ib.status = 'active' THEN ib.selling_price END) AS avg_selling_price
            FROM 
                inventory inv
            LEFT JOIN inventory_batches ib ON inv.id = ib.inventory_id AND ib.deleted_at IS NULL
            LEFT JOIN units u ON inv.unit_id = u.id
            LEFT JOIN currencies c ON inv.currency_id = c.id
            WHERE 
                inv.id = ? 
                AND inv.deleted_at IS NULL
            GROUP BY 
                inv.id
        `;

        const result = await executeQuery(sql, [inventoryId], "getInventoryWithBatches");
        return result[0] || null;
    } catch (error) {
        throw new DatabaseError("Failed to fetch inventory with batches", error);
    }
};

// Add this function to validate recipe availability
const validateRecipeAvailability = async (recipeItems) => {
    try {
        const unavailableItems = [];

        for (const item of recipeItems) {
            const { inventory_id, required_quantity } = item;

            const availability = await checkStockAvailability(inventory_id, required_quantity);

            if (!availability || !availability.sufficient_stock) {
                unavailableItems.push({
                    inventory_id,
                    inventory_name: availability?.name || "Unknown",
                    required_quantity,
                    available_quantity: availability?.available_in_batches || 0,
                    shortage: required_quantity - (availability?.available_in_batches || 0),
                });
            }
        }

        return {
            all_available: unavailableItems.length === 0,
            unavailable_items: unavailableItems,
        };
    } catch (error) {
        throw new DatabaseError("Failed to validate recipe availability", error);
    }
};

// Add this function to auto-consume ingredients for orders
const consumeIngredientsForOrder = async (orderId, ingredients, userId) => {
    try {
        const queries = [];
        const consumptionDetails = [];

        for (const ingredient of ingredients) {
            const { inventory_id, quantity } = ingredient;

            // Check availability first
            const availability = await checkStockAvailability(inventory_id, quantity);
            if (!availability || !availability.sufficient_stock) {
                throw new BusinessLogicError(
                    `Insufficient stock for ${availability?.name || "ingredient"}. Required: ${quantity}, Available: ${
                        availability?.available_in_batches || 0
                    }`
                );
            }

            // Consume from batches (FIFO)
            const { consumeFromBatchesModel } = require("../inventory-batches/model");
            const consumptionResult = await consumeFromBatchesModel(inventory_id, quantity, "order", orderId, userId);

            consumptionDetails.push({
                inventory_id,
                inventory_name: availability.name,
                consumed_quantity: quantity,
                batches_used: consumptionResult.batches_affected,
            });
        }

        return {
            success: true,
            consumption_details: consumptionDetails,
        };
    } catch (error) {
        if (error instanceof BusinessLogicError) throw error;
        throw new DatabaseError("Failed to consume ingredients for order", error);
    }
};

module.exports = {
    getInventoryItemsModel: getInventoryItems,
    getInventoryItemsByRestaurantIDModel: getInventoryItemsByRestaurantID,
    getLowStockItemsModel: getLowStockItems,
    createInventoryItemModel: createInventoryItem,
    updateInventoryItemModel: updateInventoryItem,
    deleteInventoryItemModel: deleteInventoryItem,
    getInventoryHistoryModel: getInventoryHistory,
    checkStockAvailabilityModel: checkStockAvailability,
    getInventoryWithBatchesModel: getInventoryWithBatches,
    validateRecipeAvailabilityModel: validateRecipeAvailability,
    consumeIngredientsForOrderModel: consumeIngredientsForOrder,
};
