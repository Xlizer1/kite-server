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
const { validateMenuItemAvailabilityModel } = require("../ingredients/model");

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

// Add new function to get items with availability status
const getItemsWithAvailability = async (request, callBack) => {
    try {
        const { key } = request.query;

        if (!key || typeof key !== "string") {
            throw new CustomError("Invalid key!", 400);
        }

        const { restaurant_id } = await processTableEncryptedKey(key);
        const result = await getItemsModel(restaurant_id);

        // Add availability status to each item
        const itemsWithAvailability = await Promise.all(
            result.map(async (item) => {
                try {
                    const availability = await validateMenuItemAvailabilityModel(item.id, 1);
                    return {
                        ...item,
                        available: availability.available,
                        can_prepare_quantity: availability.can_prepare_quantity || 0,
                        missing_ingredients: availability.missing_ingredients || [],
                    };
                } catch (error) {
                    // If no recipe exists, item is considered available
                    return {
                        ...item,
                        available: true,
                        can_prepare_quantity: 999,
                        missing_ingredients: [],
                        no_recipe: true,
                    };
                }
            })
        );

        callBack(resultObject(true, "Items with availability retrieved successfully", itemsWithAvailability));
    } catch (error) {
        console.error("Error in getItemsWithAvailability:", error);
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

// Add function to check item availability before adding to cart
const checkItemAvailability = async (request, callBack) => {
    try {
        const { item_id, quantity = 1 } = request.query;

        if (!item_id) {
            throw new CustomError("Item ID is required", 400);
        }

        if (isNaN(quantity) || quantity <= 0) {
            throw new CustomError("Quantity must be a positive number", 400);
        }

        try {
            const availability = await validateMenuItemAvailabilityModel(item_id, parseInt(quantity));
            callBack(resultObject(true, "Item availability checked", availability));
        } catch (error) {
            // If no recipe exists, item is considered available
            callBack(
                resultObject(true, "Item availability checked", {
                    available: true,
                    reason: "No recipe required",
                    missing_ingredients: [],
                    can_prepare_quantity: parseInt(quantity),
                    no_recipe: true,
                })
            );
        }
    } catch (error) {
        console.error("Error in checkItemAvailability:", error);
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
    getItemsWithAvailabilityController: getItemsWithAvailability,
    checkItemAvailabilityController: checkItemAvailability,
};
