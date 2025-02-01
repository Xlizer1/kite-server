const { getItemsModel, getItemsBySubCategoryIDModel, createItemModel } = require("./model");
const { resultObject, verify, processTableEncryptedKey, checkSubCategoryForRestaurant } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const getItems = async (request, callBack) => {
    try {
        const { key } = request.query;

        if (!key || typeof key !== "string") {
            throw new CustomError("Invalid key!", 400);
        }

        const { restaurant_id } = await processTableEncryptedKey(key);
        const result = await getItemsModel(restaurant_id);
        callBack(resultObject(true, "Items retrieved successfully", result));

    } catch (error) {
        console.error("Error in getItems:", error);
        callBack(resultObject(
            false, 
            error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
            null,
            error instanceof CustomError ? error.statusCode : 500
        ));
    }
};

const getItemsBySubCategoryID = async (request, callBack) => {
    try {
        const { sub_cat_id, key } = request.query;

        if (!sub_cat_id || !key || typeof key !== "string") {
            throw new CustomError("Invalid sub category id or key!", 400);
        }

        const { restaurant_id } = await processTableEncryptedKey(key);

        if (!(await checkSubCategoryForRestaurant(restaurant_id, sub_cat_id))) {
            throw new CustomError("Invalid category or restaurant.", 400);
        }

        const result = await getItemsBySubCategoryIDModel(restaurant_id, sub_cat_id);
        callBack(resultObject(true, "Items retrieved successfully", result));

    } catch (error) {
        console.error("Error in getItemsBySubCategoryID:", error);
        callBack(resultObject(
            false, 
            error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
            null,
            error instanceof CustomError ? error.statusCode : 500
        ));
    }
};

const createItem = async (request, callBack) => {
    try {
        const authorize = await verify(request?.headers["jwt"]);
        if (!authorize?.id || !authorize?.email) {
            throw new CustomError("Token is invalid!", 401);
        }

        if (!authorize?.roles?.includes(1)) {
            throw new CustomError("You don't have permission to create items!", 403);
        }

        const { 
            restaurant_id, 
            sub_category_id, 
            name, 
            description, 
            price,
            currency_id,
            is_shisha 
        } = request.body;

        const image = request.file;

        if (!restaurant_id || !sub_category_id || !name || !price || !currency_id) {
            throw new CustomError("Missing required fields!", 400);
        }

        if (!(await checkSubCategoryForRestaurant(restaurant_id, sub_category_id))) {
            throw new CustomError("Invalid sub-category for this restaurant!", 400);
        }

        await createItemModel({ 
            restaurant_id, 
            sub_category_id, 
            name, 
            description, 
            price,
            currency_id,
            is_shisha, 
            images: image ? [image] : [], 
            creator_id: authorize?.id 
        });

        callBack(resultObject(true, "Item created successfully"));

    } catch (error) {
        console.error("Error in createItem:", error);
        callBack(resultObject(
            false, 
            error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
            null,
            error instanceof CustomError ? error.statusCode : 500
        ));
    }
};

module.exports = {
    getItemsController: getItems,
    getItemsBySubCategoryIDController: getItemsBySubCategoryID,
    createItemController: createItem,
};
