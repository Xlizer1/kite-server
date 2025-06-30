const {
    createRestaurantCategoryModel,
    getRestaurantCategoryModel,
    updateCategoryImageModel,
    updateCategoryModal,
} = require("./model");
const { resultObject, verifyUserToken, processTableEncryptedKey, getToken } = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");

const getRestaurantCategory = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        const result = await getRestaurantCategoryModel(authorize.restaurant_id);

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
        const { name, restaurant_id } = request.body;
        const image = request.file;

        const result = await createRestaurantCategoryModel(name, restaurant_id, image, authorize?.id);

        if (result) {
            callBack(resultObject(true, "success"));
        } else {
            callBack(resultObject(false, "Could not create category."));
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

        const { category_id } = request.params;

        const result = await updateCategoryImageModel(category_id, request.file, authorize.id);
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

const updateCategory = async (req, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        const { category_id } = req.params;
        const { name } = req.body;

        const result = await updateCategoryModal(category_id, name, authorize.id);
    } catch (error) {
        console.log(error);

        if (error instanceof CustomError) {
            callBack(resultObject(false, error.message));
        }

        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

module.exports = {
    createRestaurantCategoryController: createRestaurantCategory,
    getRestaurantCategoryController: getRestaurantCategory,
    updateCategoryImageController: updateCategoryImage,
    updateCategoryController: updateCategory,
};
