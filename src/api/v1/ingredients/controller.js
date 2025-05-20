const { getIngredientsModel, getIngredientsByRestaurantIDModel, createIngredientModel } = require("./model");
const { resultObject, verifyUserToken } = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");

const getIngredients = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"]);
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
        const authorize = await verifyUserToken(request?.headers["jwt"]);

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
        const authorize = await verifyUserToken(request?.headers["jwt"]);

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

module.exports = {
    getIngredientsController: getIngredients,
    getIngredientsByRestaurantIDController: getIngredientsByRestaurantID,
    createIngredientController: createIngredient,
};
