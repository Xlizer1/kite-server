const { getItemsModel, getItemsBySubCategoryIDModel, getPaginatedItemsBySubCategoryIDModel, createItemModel, updateItemImageModel } = require("./model");
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

const getPaginatedItemsBySubCategoryID = async (request, callBack) => {
    try {
        const { sub_cat_id, page = 0, key } = request.query;
        const limit = 5;
        const offset = parseInt(page) * limit;

        if (!sub_cat_id || !key) {
            callBack(resultObject(false, "Missing required parameters: sub_cat_id and key"));
            return;
        }

        // Process the key and validate restaurant_id - add await here
        const decryptedData = await processTableEncryptedKey(key);
        if (!decryptedData || !decryptedData.restaurant_id) {
            callBack(resultObject(false, "Invalid key: could not get restaurant_id"));
            return;
        }

        const restaurant_id = parseInt(decryptedData.restaurant_id);
        if (isNaN(restaurant_id)) {
            callBack(resultObject(false, "Invalid restaurant_id from key"));
            return;
        }
        
        const result = await getPaginatedItemsBySubCategoryIDModel(
            parseInt(sub_cat_id),
            restaurant_id,
            limit,
            offset
        );
        
        callBack(resultObject(true, "Items retrieved successfully", result));
    } catch (error) {
        console.error("Error in getPaginatedItemsBySubCategoryID:", error);
        callBack(resultObject(false, error.message));
    }
};

const createItem = async (request, callBack) => {
    try {
        const authorize = await verify(request?.headers["jwt"]);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        }

        if (!authorize?.roles?.includes(1)) {
            callBack(resultObject(false, "You don't have permission to create items!"));
            return;
        }

        // Validate image
        if (!request.file) {
            callBack(resultObject(false, "Image is required"));
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        if (!allowedTypes.includes(request.file.mimetype)) {
            callBack(resultObject(false, `Invalid file type for image: ${request.file.originalname}`));
            return;
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

        if (!restaurant_id || !sub_category_id || !name || !price || !currency_id) {
            callBack(resultObject(false, "Missing required fields!"));
            return;
        }

        if (!(await checkSubCategoryForRestaurant(restaurant_id, sub_category_id))) {
            callBack(resultObject(false, "Invalid sub-category for this restaurant!"));
            return;
        }

        const result = await createItemModel({ 
            restaurant_id, 
            sub_category_id, 
            name, 
            description, 
            price,
            currency_id,
            is_shisha, 
            images: [request.file], 
            creator_id: authorize?.id 
        });

        callBack(resultObject(true, "Item created successfully", result));

    } catch (error) {
        console.error("Error in createItem:", error);
        
        if (error instanceof CustomError) {
            callBack(resultObject(false, error.message));
            return;
        }
        
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

const updateItemImage = async (request, callBack) => {
    try {
        const authorize = await verify(request?.headers["jwt"]);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        }

        if (!authorize?.roles?.includes(1)) {
            callBack(resultObject(false, "You don't have permission to update item images!"));
            return;
        }

        const { id } = request.params;
        
        if (!request.file) {
            callBack(resultObject(false, "No image file provided"));
            return;
        }

        const result = await updateItemImageModel(id, request.file, authorize.id);
        callBack(resultObject(true, "Item image updated successfully", result));
    } catch (error) {
        console.error("Error in updateItemImage:", error);
        
        if (error instanceof CustomError) {
            callBack(resultObject(false, error.message));
            return;
        }
        
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

module.exports = {
    getItemsController: getItems,
    getItemsBySubCategoryIDController: getItemsBySubCategoryID,
    createItemController: createItem,
    updateItemImageController: updateItemImage,
    getPaginatedItemsBySubCategoryIDController: getPaginatedItemsBySubCategoryID
};
