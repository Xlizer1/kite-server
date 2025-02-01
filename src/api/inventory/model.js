const { executeQuery, executeTransaction, buildInsertQuery, buildUpdateQuery } = require("../../helpers/db");
const { CustomError } = require("../../middleware/errorHandler");

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
        throw new CustomError(error.message, 500);
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
            throw new CustomError("No inventory items found for this restaurant", 404);
        }
        return result;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        throw new CustomError(error.message, 500);
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

        return await executeQuery(sql, [restaurant_id], "getLowStockItems");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const createInventoryItem = async (itemData) => {
    try {
        const { 
            restaurant_id, 
            name, 
            quantity, 
            unit_id, 
            threshold, 
            price, 
            currency_id, 
            created_by 
        } = itemData;

        // Validate if unit exists
        const unitCheckSql = `SELECT id FROM units WHERE id = ? AND deleted_at IS NULL`;
        const unitResult = await executeQuery(unitCheckSql, [unit_id], "checkUnit");
        if (!unitResult.length) {
            throw new CustomError("Invalid unit", 400);
        }

        // Validate if currency exists
        const currencyCheckSql = `SELECT id FROM currencies WHERE id = ? AND deleted_at IS NULL`;
        const currencyResult = await executeQuery(currencyCheckSql, [currency_id], "checkCurrency");
        if (!currencyResult.length) {
            throw new CustomError("Invalid currency", 400);
        }

        // Check for duplicate item name in the same restaurant
        const duplicateCheckSql = `
            SELECT id FROM inventory 
            WHERE restaurant_id = ? AND name = ? AND deleted_at IS NULL
        `;
        const duplicateResult = await executeQuery(duplicateCheckSql, [restaurant_id, name], "checkDuplicate");
        if (duplicateResult.length) {
            throw new CustomError("An item with this name already exists in this restaurant", 400);
        }

        // Create inventory item and its first history record
        const queries = [];

        // Add inventory insert query
        const inventoryQuery = buildInsertQuery('inventory', {
            restaurant_id,
            name,
            quantity,
            unit_id,
            threshold,
            price,
            currency_id,
            created_by,
            created_at: new Date()
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
            params: [quantity, quantity, created_by]
        });

        // Execute transaction
        await executeTransaction(queries, 'createInventoryItem');
        return true;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        throw new CustomError(error.message, 500);
    }
};

const updateInventoryItem = async (id, itemData) => {
    try {
        const { 
            name, 
            quantity, 
            unit_id, 
            threshold, 
            price, 
            currency_id,
            updated_by 
        } = itemData;

        // Check if item exists
        const checkSql = `
            SELECT quantity FROM inventory 
            WHERE id = ? AND deleted_at IS NULL
        `;
        const checkResult = await executeQuery(checkSql, [id], "checkInventoryItem");
        if (!checkResult.length) {
            throw new CustomError("Inventory item not found", 404);
        }

        const oldQuantity = checkResult[0].quantity;

        // Start transaction for update
        const queries = [];

        // Add inventory update query
        const updateQuery = buildUpdateQuery('inventory', 
            {
                name,
                quantity,
                unit_id,
                threshold,
                price,
                currency_id,
                updated_by,
                updated_at: new Date()
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
                params: [id, quantityChange, quantity, 'update', updated_by]
            });
        }

        // Execute transaction
        await executeTransaction(queries, 'updateInventoryItem');
        return true;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        throw new CustomError(error.message, 500);
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
            throw new CustomError("Inventory item not found", 404);
        }
        return true;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        throw new CustomError(error.message, 500);
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
        throw new CustomError(error.message, 500);
    }
};

module.exports = {
    getInventoryItemsModel: getInventoryItems,
    getInventoryItemsByRestaurantIDModel: getInventoryItemsByRestaurantID,
    getLowStockItemsModel: getLowStockItems,
    createInventoryItemModel: createInventoryItem,
    updateInventoryItemModel: updateInventoryItem,
    deleteInventoryItemModel: deleteInventoryItem,
    getInventoryHistoryModel: getInventoryHistory
};
