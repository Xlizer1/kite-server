const {
    getItemsModel,
    getItemByIDModel,
    getItemsByCategoryIDModel,
    getPaginatedItemsByCategoryIDModel,
    createItemModel,
    updateItemImageModel,
} = require("./model");
const {
    resultObject,
    verifyUserToken,
    processTableEncryptedKey,
    checkCategoryForRestaurant,
    getToken,
} = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");

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

const getItemByID = async (request, callBack) => {
    try {
        const { item_id } = request.params;

        const result = await getItemByIDModel(item_id);
        callBack(resultObject(true, "Items retrieved successfully", result));
    } catch (error) {
        console.error("Error in getItems:", error);
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

const getItemsByCategoryID = async (request, callBack) => {
    try {
        const { category_id, key } = request.query;

        if (!category_id || !key || typeof key !== "string") {
            throw new CustomError("Invalid category id or key!", 400);
        }

        const { restaurant_id } = await processTableEncryptedKey(key);

        if (!(await checkCategoryForRestaurant(restaurant_id, category_id))) {
            throw new CustomError("Invalid category or restaurant.", 400);
        }

        const result = await getItemsByCategoryIDModel(restaurant_id, category_id);
        callBack(resultObject(true, "Items retrieved successfully", result));
    } catch (error) {
        console.error("Error in getItemsByCategoryID:", error);
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

const getPaginatedItemsByCategoryID = async (request, callBack) => {
    try {
        const { category_id, page = 0, key } = request.query;
        const limit = 5;
        const offset = parseInt(page) * limit;

        if (!category_id || !key) {
            callBack(resultObject(false, "Missing required parameters: category_id and key"));
            return;
        }

        const { restaurant_id } = await processTableEncryptedKey(key);

        const result = await getPaginatedItemsByCategoryIDModel(
            parseInt(category_id),
            parseInt(restaurant_id),
            limit,
            offset
        );

        callBack(resultObject(true, result?.length ? "Items retrieved successfully" : "No items were found!", result));
    } catch (error) {
        console.error("Error in getPaginatedItemsByCategoryID:", error);
        callBack(resultObject(false, error.message));
    }
};

const createItem = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.roles?.includes(1)) {
            callBack(resultObject(false, "You don't have permission to create items!"));
            return;
        }

        // Validate image
        if (!request.file) {
            callBack(resultObject(false, "Image is required"));
            return;
        }

        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
        if (!allowedTypes.includes(request.file.mimetype)) {
            callBack(resultObject(false, `Invalid file type for image: ${request.file.originalname}`));
            return;
        }

        const { restaurant_id, category_id, name, description, price, currency_id, is_shisha } = request.body;

        if (!restaurant_id || !category_id || !name || !price || !currency_id) {
            callBack(resultObject(false, "Missing required fields!"));
            return;
        }

        if (!(await checkCategoryForRestaurant(restaurant_id, category_id))) {
            callBack(resultObject(false, "Invalid category for this restaurant!"));
            return;
        }

        const result = await createItemModel({
            restaurant_id,
            category_id,
            name,
            description,
            price,
            currency_id,
            is_shisha,
            images: [request.file],
            creator_id: authorize?.id,
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
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

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
    getItemByIDController: getItemByID,
    getItemsByCategoryIDController: getItemsByCategoryID,
    createItemController: createItem,
    updateItemImageController: updateItemImage,
    getPaginatedItemsByCategoryIDController: getPaginatedItemsByCategoryID,
};
