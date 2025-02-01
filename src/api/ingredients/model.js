const { executeQuery, executeTransaction, buildInsertQuery } = require("../../helpers/db");
const { CustomError } = require("../../middleware/errorHandler");

const getIngredients = async () => {
    try {
        const sql = `
            SELECT
                i.id,
                i.restaurant_id,
                inv.name AS inventory_name,
                i.quantity,
                u.name AS unit_name,
                m.name AS menu_item_name,
                i.created_at,
                i.updated_at
            FROM
                ingredients i
            LEFT JOIN 
                units u ON i.unit_id = u.id
            LEFT JOIN 
                inventory inv ON i.inv_item_id = inv.id
            LEFT JOIN
                menu m ON i.menu_item_id = m.id
            WHERE
                i.deleted_at IS NULL
            ORDER BY
                i.restaurant_id, m.name
        `;

        return await executeQuery(sql, [], "getIngredients");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const getIngredientsByRestaurantID = async (restaurant_id) => {
    try {
        const sql = `
            SELECT
                i.id,
                i.restaurant_id,
                inv.name AS inventory_name,
                i.quantity,
                u.name AS unit_name,
                m.name AS menu_item_name,
                i.created_at,
                i.updated_at
            FROM
                ingredients i
            LEFT JOIN 
                units u ON i.unit_id = u.id
            LEFT JOIN 
                inventory inv ON i.inv_item_id = inv.id
            LEFT JOIN
                menu m ON i.menu_item_id = m.id
            WHERE
                i.restaurant_id = ?
            AND
                i.deleted_at IS NULL
            ORDER BY
                m.name
        `;

        const result = await executeQuery(sql, [restaurant_id], "getIngredientsByRestaurantID");
        if (!result.length) {
            throw new CustomError("No ingredients found for this restaurant", 404);
        }
        return result;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        throw new CustomError(error.message, 500);
    }
};

const createIngredient = async (data) => {
    try {
        const { 
            restaurant_id, 
            menu_item_id, 
            inv_item_id, 
            unit_id, 
            quantity,
            creator_id 
        } = data;

        // Validate if inventory item exists and belongs to the restaurant
        const invCheckSql = `
            SELECT id FROM inventory 
            WHERE id = ? 
            AND restaurant_id = ? 
            AND deleted_at IS NULL
        `;
        const invResult = await executeQuery(invCheckSql, [inv_item_id, restaurant_id], "checkInventoryItem");
        if (!invResult.length) {
            throw new CustomError("Invalid inventory item for this restaurant", 400);
        }

        // Validate if menu item exists and belongs to the restaurant
        const menuCheckSql = `
            SELECT id FROM menu 
            WHERE id = ? 
            AND restaurant_id = ? 
            AND deleted_at IS NULL
        `;
        const menuResult = await executeQuery(menuCheckSql, [menu_item_id, restaurant_id], "checkMenuItem");
        if (!menuResult.length) {
            throw new CustomError("Invalid menu item for this restaurant", 400);
        }

        // Validate if unit exists
        const unitCheckSql = `
            SELECT id FROM units 
            WHERE id = ? 
            AND deleted_at IS NULL
        `;
        const unitResult = await executeQuery(unitCheckSql, [unit_id], "checkUnit");
        if (!unitResult.length) {
            throw new CustomError("Invalid unit", 400);
        }

        // Create ingredient with transaction
        const queries = [];

        // Add ingredient insert query
        const ingredientQuery = buildInsertQuery('ingredients', {
            restaurant_id,
            menu_item_id,
            inv_item_id,
            unit_id,
            quantity,
            created_at: new Date(),
            created_by: creator_id
        });
        queries.push(ingredientQuery);

        // Execute transaction
        await executeTransaction(queries, 'createIngredient');
        return true;

    } catch (error) {
        if (error instanceof CustomError) throw error;
        throw new CustomError(error.message, 500);
    }
};

module.exports = {
    getIngredientsModel: getIngredients,
    getIngredientsByRestaurantIDModel: getIngredientsByRestaurantID,
    createIngredientModel: createIngredient
};
