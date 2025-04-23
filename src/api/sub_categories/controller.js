const {
    createSubRestaurantCategoryModel,
    getRestaurantSubCategoryModel,
    getRestaurantSubCategoryByIDModel,
    updateSubCategoryImageModel,
} = require("./model");
const {
    resultObject,
    verifyUserToken,
    checkCategoryForRestaurant,
    processTableEncryptedKey,
} = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const getSubCategories = async (request, callBack) => {
    try {
        const { key } = request.query;

        if (!key || typeof key !== "string") {
            callBack(resultObject(false, "Invalid key!"));
            return;
        }

        const { restaurant_id } = await processTableEncryptedKey(key);

        const result = await getRestaurantSubCategoryModel(restaurant_id);

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

const getSubCategoriesByCategoryID = async (request, callBack) => {
    try {
        const { category_id, key } = request.query;

        if (!category_id || !key || typeof key !== "string") {
            callBack(resultObject(false, "Invalid category id or key!"));
            return;
        }

        const { restaurant_id } = await processTableEncryptedKey(key);

        if (!(await checkCategoryForRestaurant(restaurant_id, category_id))) {
            callBack(resultObject(false, "Invalid category or restaurant."));
            return;
        }

        const result = await getRestaurantSubCategoryByIDModel(restaurant_id, category_id);

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

const createSubRestaurantCategory = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"]);
        if (authorize?.roles?.includes(1)) {
            const { name, category_id } = request.body;
            const image = request.file;

            if (!name || !category_id || !image) {
                if (!image) {
                    callBack(resultObject(false, "Image is required."));
                    return;
                } else if (!name) {
                    callBack(resultObject(false, "Name is required."));
                    return;
                } else {
                    callBack(resultObject(false, "Category ID is required."));
                    return;
                }
            }

            const result = await createSubRestaurantCategoryModel(name, category_id, image, authorize?.id);

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

const updateSubCategoryImage = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"]);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        }

        if (!authorize?.roles?.includes(1)) {
            callBack(resultObject(false, "You don't have permission to update sub-category images!"));
            return;
        }

        const { id } = request.params;

        if (!request.file) {
            callBack(resultObject(false, "No image file provided"));
            return;
        }

        const result = await updateSubCategoryImageModel(id, request.file, authorize.id);
        callBack(resultObject(true, "Sub-category image updated successfully", result));
    } catch (error) {
        console.error("Error in updateSubCategoryImage:", error);

        if (error instanceof CustomError) {
            callBack(resultObject(false, error.message));
            return;
        }

        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

module.exports = {
    createSubRestaurantCategoryController: createSubRestaurantCategory,
    getSubCategoriesController: getSubCategories,
    getSubCategoriesByCategoryIDController: getSubCategoriesByCategoryID,
    updateSubCategoryImageController: updateSubCategoryImage,
};
