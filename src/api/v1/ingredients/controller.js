const {
    getIngredientsModel,
    getIngredientsByRestaurantIDModel,
    createIngredientModel,
    getRecipeWithAvailabilityModel,
    validateMenuItemAvailabilityModel,
    getRestaurantRecipesWithAvailabilityModel,
    validateMultipleMenuItemsModel,
    createRecipeModel,
} = require("./model");
const { resultObject, verifyUserToken, getToken } = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");

const getIngredients = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.roles?.includes(1)) {
            throw new CustomError("You don't have permission to view ingredients!", 403);
        }

        const result = await getIngredientsModel();
        callBack(resultObject(true, "Ingredients retrieved successfully", result));
    } catch (error) {
        console.error("Error in getIngredients:", error);
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

const getIngredientsByRestaurantID = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1)) {
            throw new CustomError("You don't have permission to view ingredients!", 403);
        }

        const { restaurant_id } = request.params;
        if (!restaurant_id) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        const result = await getIngredientsByRestaurantIDModel(restaurant_id);
        callBack(resultObject(true, "Ingredients retrieved successfully", result));
    } catch (error) {
        console.error("Error in getIngredientsByRestaurantID:", error);
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

const createIngredient = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1)) {
            throw new CustomError("You don't have permission to create ingredients!", 403);
        }

        const { restaurant_id, menu_item_id, inv_item_id, unit_id, quantity } = request.body;

        // Validate required fields
        if (!restaurant_id || !menu_item_id || !inv_item_id || !unit_id || !quantity) {
            throw new CustomError("Missing required fields", 400);
        }

        // Validate quantity is positive number
        if (isNaN(quantity) || quantity <= 0) {
            throw new CustomError("Quantity must be a positive number", 400);
        }

        const itemData = {
            restaurant_id,
            menu_item_id,
            inv_item_id,
            unit_id,
            quantity,
            creator_id: authorize.id,
        };

        await createIngredientModel(itemData);
        callBack(resultObject(true, "Ingredient created successfully"));
    } catch (error) {
        console.error("Error in createIngredient:", error);
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

// Add this function to get recipe with stock availability
const getRecipeWithAvailability = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (
            !authorize?.roles?.includes(1) &&
            authorize?.department_id !== 2 &&
            authorize?.department_id !== 4 &&
            authorize?.department_id !== 6
        ) {
            throw new CustomError("You don't have permission to view recipes!", 403);
        }

        const { menu_item_id } = request.params;
        if (!menu_item_id) {
            throw new CustomError("Menu item ID is required", 400);
        }

        const result = await getRecipeWithAvailabilityModel(menu_item_id);
        callBack(resultObject(true, "Recipe with availability retrieved successfully", result));
    } catch (error) {
        console.error("Error in getRecipeWithAvailability:", error);
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

// Add this function to validate menu item availability
const validateMenuItemAvailability = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (
            !authorize?.roles?.includes(1) &&
            authorize?.department_id !== 2 &&
            authorize?.department_id !== 4 &&
            authorize?.department_id !== 5 &&
            authorize?.department_id !== 6
        ) {
            throw new CustomError("You don't have permission to check item availability!", 403);
        }

        const { menu_item_id } = request.params;
        const { quantity = 1 } = request.query;

        if (!menu_item_id) {
            throw new CustomError("Menu item ID is required", 400);
        }

        if (isNaN(quantity) || quantity <= 0) {
            throw new CustomError("Quantity must be a positive number", 400);
        }

        const result = await validateMenuItemAvailabilityModel(menu_item_id, parseInt(quantity));
        callBack(resultObject(true, "Menu item availability checked successfully", result));
    } catch (error) {
        console.error("Error in validateMenuItemAvailability:", error);
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

// Add this function to get restaurant recipes with availability
const getRestaurantRecipesWithAvailability = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (
            !authorize?.roles?.includes(1) &&
            authorize?.department_id !== 2 &&
            authorize?.department_id !== 4 &&
            authorize?.department_id !== 6
        ) {
            throw new CustomError("You don't have permission to view restaurant recipes!", 403);
        }

        const { restaurant_id } = request.params;
        const restaurantId = restaurant_id || authorize.restaurant_id;

        if (!restaurantId) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        const result = await getRestaurantRecipesWithAvailabilityModel(restaurantId);
        callBack(resultObject(true, "Restaurant recipes with availability retrieved successfully", result));
    } catch (error) {
        console.error("Error in getRestaurantRecipesWithAvailability:", error);
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

// Add this function to validate multiple menu items for order
const validateMultipleMenuItems = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (
            !authorize?.roles?.includes(1) &&
            authorize?.department_id !== 2 &&
            authorize?.department_id !== 4 &&
            authorize?.department_id !== 5 &&
            authorize?.department_id !== 6
        ) {
            throw new CustomError("You don't have permission to validate order items!", 403);
        }

        const { items } = request.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new CustomError("Items array is required and must not be empty", 400);
        }

        // Validate each item structure
        for (const item of items) {
            if (!item.menu_item_id || !item.quantity) {
                throw new CustomError("Each item must have menu_item_id and quantity", 400);
            }
            if (isNaN(item.quantity) || item.quantity <= 0) {
                throw new CustomError("Item quantity must be a positive number", 400);
            }
        }

        const result = await validateMultipleMenuItemsModel(items);
        callBack(resultObject(true, "Multiple menu items validated successfully", result));
    } catch (error) {
        console.error("Error in validateMultipleMenuItems:", error);
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

// Add this function to create complete recipe
const createCompleteRecipe = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1) && authorize?.department_id !== 2) {
            throw new CustomError("You don't have permission to create recipes!", 403);
        }

        const { menu_item_id, ingredients } = request.body;

        if (!menu_item_id) {
            throw new CustomError("Menu item ID is required", 400);
        }

        if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
            throw new CustomError("Ingredients array is required and must not be empty", 400);
        }

        // Validate each ingredient structure
        for (const ingredient of ingredients) {
            if (!ingredient.inv_item_id || !ingredient.unit_id || !ingredient.quantity) {
                throw new CustomError("Each ingredient must have inv_item_id, unit_id, and quantity", 400);
            }
        }

        await createRecipeModel(menu_item_id, ingredients, authorize.id);
        callBack(resultObject(true, "Recipe created successfully"));
    } catch (error) {
        console.error("Error in createCompleteRecipe:", error);
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
    getIngredientsController: getIngredients,
    getIngredientsByRestaurantIDController: getIngredientsByRestaurantID,
    createIngredientController: createIngredient,
    getRecipeWithAvailabilityController: getRecipeWithAvailability,
    validateMenuItemAvailabilityController: validateMenuItemAvailability,
    getRestaurantRecipesWithAvailabilityController: getRestaurantRecipesWithAvailability,
    validateMultipleMenuItemsController: validateMultipleMenuItems,
    createCompleteRecipeController: createCompleteRecipe,
};
