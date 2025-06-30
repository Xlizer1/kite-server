const { executeQuery, executeTransaction, buildInsertQuery } = require("../../../helpers/db");
const { CustomError } = require("../../../middleware/errorHandler");

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
        const { restaurant_id, menu_item_id, inv_item_id, unit_id, quantity, creator_id } = data;

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
        const ingredientQuery = buildInsertQuery("ingredients", {
            restaurant_id,
            menu_item_id,
            inv_item_id,
            unit_id,
            quantity,
            created_at: new Date(),
            created_by: creator_id,
        });
        queries.push(ingredientQuery);

        // Execute transaction
        await executeTransaction(queries, "createIngredient");
        return true;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        throw new CustomError(error.message, 500);
    }
};

// Add this function to get recipe with stock availability
const getRecipeWithAvailability = async (menuItemId) => {
    try {
        const sql = `
            SELECT 
                i.id AS ingredient_id,
                i.quantity AS required_quantity,
                inv.id AS inventory_id,
                inv.name AS inventory_name,
                inv.quantity AS total_stock,
                u.name AS unit_name,
                u.unit_symbol,
                COALESCE(SUM(ib.current_quantity), 0) AS available_in_batches,
                CASE 
                    WHEN COALESCE(SUM(ib.current_quantity), 0) >= i.quantity THEN true 
                    ELSE false 
                END AS sufficient_stock,
                CASE 
                    WHEN COALESCE(SUM(ib.current_quantity), 0) < i.quantity 
                    THEN i.quantity - COALESCE(SUM(ib.current_quantity), 0)
                    ELSE 0 
                END AS shortage_quantity,
                COUNT(CASE WHEN ib.status = 'active' THEN 1 END) AS active_batches,
                MIN(CASE WHEN ib.status = 'active' AND ib.expiry_date > CURDATE() THEN ib.expiry_date END) AS next_expiry_date
            FROM 
                ingredients i
            LEFT JOIN inventory inv ON i.inv_item_id = inv.id
            LEFT JOIN units u ON i.unit_id = u.id
            LEFT JOIN inventory_batches ib ON inv.id = ib.inventory_id 
                AND ib.status = 'active' 
                AND ib.current_quantity > 0
                AND ib.deleted_at IS NULL
            WHERE 
                i.menu_item_id = ?
                AND i.deleted_at IS NULL
                AND inv.deleted_at IS NULL
            GROUP BY 
                i.id, i.quantity, inv.id, inv.name, inv.quantity, u.name, u.unit_symbol
            ORDER BY 
                inv.name
        `;

        const result = await executeQuery(sql, [menuItemId], "getRecipeWithAvailability");

        // Calculate overall recipe availability
        const allIngredientsAvailable = result.every((ingredient) => ingredient.sufficient_stock);
        const totalShortage = result.reduce((sum, ingredient) => sum + ingredient.shortage_quantity, 0);

        return {
            menu_item_id: menuItemId,
            ingredients: result,
            recipe_available: allIngredientsAvailable,
            total_ingredients: result.length,
            available_ingredients: result.filter((ingredient) => ingredient.sufficient_stock).length,
            total_shortage: totalShortage,
        };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

// Add this function to validate menu item can be prepared
const validateMenuItemAvailability = async (menuItemId, requestedQuantity = 1) => {
    try {
        const recipe = await getRecipeWithAvailability(menuItemId);

        if (!recipe.ingredients.length) {
            return {
                available: false,
                reason: "No recipe found for this menu item",
                missing_ingredients: [],
            };
        }

        const missingIngredients = recipe.ingredients
            .filter((ingredient) => ingredient.available_in_batches < ingredient.required_quantity * requestedQuantity)
            .map((ingredient) => ({
                name: ingredient.inventory_name,
                required: ingredient.required_quantity * requestedQuantity,
                available: ingredient.available_in_batches,
                shortage: ingredient.required_quantity * requestedQuantity - ingredient.available_in_batches,
                unit: ingredient.unit_name,
            }));

        return {
            available: missingIngredients.length === 0,
            reason: missingIngredients.length > 0 ? "Insufficient ingredients" : "All ingredients available",
            missing_ingredients: missingIngredients,
            can_prepare_quantity: missingIngredients.length === 0 ? requestedQuantity : 0,
        };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

// Add this function to get all recipes for a restaurant with availability
const getRestaurantRecipesWithAvailability = async (restaurantId) => {
    try {
        const sql = `
            SELECT 
                items.id AS menu_item_id,
                items.name AS menu_item_name,
                items.price,
                cat.name AS category_name,
                COUNT(i.id) AS total_ingredients,
                COUNT(CASE WHEN COALESCE(batch_stock.available_quantity, 0) >= i.quantity THEN 1 END) AS available_ingredients,
                CASE 
                    WHEN COUNT(i.id) = COUNT(CASE WHEN COALESCE(batch_stock.available_quantity, 0) >= i.quantity THEN 1 END) 
                    THEN true 
                    ELSE false 
                END AS can_prepare,
                MIN(CASE 
                    WHEN COALESCE(batch_stock.available_quantity, 0) > 0 
                    THEN FLOOR(batch_stock.available_quantity / i.quantity)
                    ELSE 0
                END) AS max_preparable_quantity
            FROM 
                items
            LEFT JOIN categories cat ON items.category_id = cat.id
            LEFT JOIN ingredients i ON items.id = i.menu_item_id AND i.deleted_at IS NULL
            LEFT JOIN inventory inv ON i.inv_item_id = inv.id AND inv.deleted_at IS NULL
            LEFT JOIN (
                SELECT 
                    ib.inventory_id,
                    SUM(ib.current_quantity) AS available_quantity
                FROM 
                    inventory_batches ib
                WHERE 
                    ib.status = 'active' 
                    AND ib.current_quantity > 0
                    AND ib.deleted_at IS NULL
                GROUP BY 
                    ib.inventory_id
            ) batch_stock ON inv.id = batch_stock.inventory_id
            WHERE 
                items.restaurant_id = ?
                AND items.deleted_at IS NULL
            GROUP BY 
                items.id, items.name, items.price, cat.name
            ORDER BY 
                can_prepare DESC, items.name
        `;

        const result = await executeQuery(sql, [restaurantId], "getRestaurantRecipesWithAvailability");
        return result;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

// Add this function to check if multiple menu items can be prepared
const validateMultipleMenuItems = async (orderItems) => {
    try {
        const validationResults = [];
        const overallShortages = {};

        for (const orderItem of orderItems) {
            const { menu_item_id, quantity } = orderItem;

            const validation = await validateMenuItemAvailability(menu_item_id, quantity);
            validationResults.push({
                menu_item_id,
                quantity,
                ...validation,
            });

            // Aggregate shortages
            if (!validation.available) {
                validation.missing_ingredients.forEach((ingredient) => {
                    if (overallShortages[ingredient.name]) {
                        overallShortages[ingredient.name].shortage += ingredient.shortage;
                    } else {
                        overallShortages[ingredient.name] = { ...ingredient };
                    }
                });
            }
        }

        const allItemsAvailable = validationResults.every((result) => result.available);

        return {
            all_items_available: allItemsAvailable,
            item_validations: validationResults,
            overall_shortages: Object.values(overallShortages),
            total_shortage_count: Object.keys(overallShortages).length,
        };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

// Add function to create recipe with validation
const createRecipe = async (menuItemId, ingredients, creatorId) => {
    try {
        // Validate that all inventory items exist and belong to the same restaurant
        const restaurantCheckSql = `
            SELECT restaurant_id FROM items WHERE id = ? AND deleted_at IS NULL
        `;
        const restaurantResult = await executeQuery(restaurantCheckSql, [menuItemId], "checkMenuItemRestaurant");
        if (!restaurantResult.length) {
            throw new CustomError("Menu item not found", 404);
        }

        const restaurantId = restaurantResult[0].restaurant_id;

        // Validate all inventory items belong to the same restaurant
        for (const ingredient of ingredients) {
            const { inv_item_id, unit_id, quantity } = ingredient;

            const invCheckSql = `
                SELECT restaurant_id FROM inventory 
                WHERE id = ? AND restaurant_id = ? AND deleted_at IS NULL
            `;
            const invResult = await executeQuery(invCheckSql, [inv_item_id, restaurantId], "checkInventoryRestaurant");
            if (!invResult.length) {
                throw new CustomError(`Inventory item ${inv_item_id} not found in this restaurant`, 400);
            }

            // Validate unit exists
            const unitCheckSql = `SELECT id FROM units WHERE id = ?`;
            const unitResult = await executeQuery(unitCheckSql, [unit_id], "checkUnit");
            if (!unitResult.length) {
                throw new CustomError(`Unit ${unit_id} not found`, 400);
            }

            if (isNaN(quantity) || quantity <= 0) {
                throw new CustomError("Ingredient quantity must be a positive number", 400);
            }
        }

        // Create recipe ingredients in transaction
        const queries = [];

        // Delete existing recipe first
        queries.push({
            sql: `
                UPDATE ingredients 
                SET deleted_at = NOW(), deleted_by = ?
                WHERE menu_item_id = ?
            `,
            params: [creatorId, menuItemId],
        });

        // Insert new ingredients
        for (const ingredient of ingredients) {
            const ingredientQuery = buildInsertQuery("ingredients", {
                restaurant_id: restaurantId,
                menu_item_id: menuItemId,
                inv_item_id: ingredient.inv_item_id,
                unit_id: ingredient.unit_id,
                quantity: ingredient.quantity,
                created_at: new Date(),
                created_by: creatorId,
            });
            queries.push(ingredientQuery);
        }

        await executeTransaction(queries, "createRecipe");
        return true;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        throw new CustomError(error.message, 500);
    }
};

module.exports = {
    getIngredientsModel: getIngredients,
    getIngredientsByRestaurantIDModel: getIngredientsByRestaurantID,
    createIngredientModel: createIngredient,
    getRecipeWithAvailabilityModel: getRecipeWithAvailability,
    validateMenuItemAvailabilityModel: validateMenuItemAvailability,
    getRestaurantRecipesWithAvailabilityModel: getRestaurantRecipesWithAvailability,
    validateMultipleMenuItemsModel: validateMultipleMenuItems,
    createRecipeModel: createRecipe,
};
