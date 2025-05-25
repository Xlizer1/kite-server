const { createRestaurantCategoryModel, getRestaurantCategoryModel, updateCategoryImageModel } = require("./model");
const { resultObject, verifyUserToken, processTableEncryptedKey, getToken } = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");

const getRestaurantCategory = async (request, callBack) => {
    try {
        const { key } = request.query;

        if (!key || typeof key !== "string") {
            callBack(resultObject(false, "Invalid Table Key!"));
            return;
        }
        const { restaurant_id } = await processTableEncryptedKey(key);

        if (!restaurant_id) {
            callBack(resultObject(false, "Invalid Table"));
            return;
        }

        const result = await getRestaurantCategoryModel(restaurant_id);

        if (result) {
            callBack(resultObject(true, "success", result));
        } else {
            callBack(resultObject(false, "Could not get category."));
        }
    } catch (error) {
        callBack({
            status: false,
            message: "Something went wrong. Please try again later.",
        });
        console.log(error);
    }
};

const createRestaurantCategory = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (authorize?.roles?.includes(1)) {
            const { name, restaurant_id } = request.body;
            const image = request.file;

            if (!name || !restaurant_id || !image) {
                callBack(resultObject(false, "Invalid category"));
                return;
            }

            const result = await createRestaurantCategoryModel(name, restaurant_id, image, authorize?.id);

            if (result) {
                callBack(resultObject(true, "success"));
            } else {
                callBack(resultObject(false, "Could not create category."));
            }
        } else {
            callBack(resultObject(false, "You don't have the permission to view restaurants!"));
            return;
        }
    } catch (error) {
        callBack({
            status: false,
            message: "Something went wrong. Please try again later.",
        });
        console.log(error);
    }
};

const updateCategoryImage = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1)) {
            callBack(resultObject(false, "You don't have permission to update category images!"));
            return;
        }

        const { id } = request.params;

        if (!request.file) {
            callBack(resultObject(false, "No image file provided"));
            return;
        }

        const result = await updateCategoryImageModel(id, request.file, authorize.id);
        callBack(resultObject(true, "Category image updated successfully", result));
    } catch (error) {
        console.error("Error in updateCategoryImage:", error);

        if (error instanceof CustomError) {
            callBack(resultObject(false, error.message));
            return;
        }

        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

module.exports = {
    createRestaurantCategoryController: createRestaurantCategory,
    getRestaurantCategoryController: getRestaurantCategory,
    updateCategoryImageController: updateCategoryImage,
};
