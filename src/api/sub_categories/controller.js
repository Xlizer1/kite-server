const { createSubRestaurantCategoryModel, getSubRestaurantCategoryModel } = require("./model");
const { resultObject, verify, checkCategoryForRestaurant, processTableEncryptedKey } = require("../../helpers/common");

const getSubRestaurantCategory = async (request, callBack) => {
    try {
        const authorize = await verify(request?.headers["jwt"]);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        } else {
            if (authorize?.roles?.includes(1)) {
                const { category_id, key } = request.query;

                if (!category_id || !key || typeof key !== "string") {
                    callBack(resultObject(false, "Invalid category id or key!"));
                    return;
                }

                const { restaurant_id } = await processTableEncryptedKey(key);

                if(!await checkCategoryForRestaurant(restaurant_id, category_id)) {
                    callBack(resultObject(false, "Invalid category or restaurant."));
                    return;
                }

                const result = await getSubRestaurantCategoryModel(category_id);

                if (result) {
                    callBack(resultObject(true, "success", result));
                } else {
                    callBack(resultObject(false, "Could not get category."));
                }
            } else {
                callBack(resultObject(false, "You don't have the permission to view restaurants!"));
                return;
            }
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
        const authorize = await verify(request?.headers["jwt"]);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        } else {
            if (authorize?.roles?.includes(1)) {
                const { name, category_id } = request.body;
                const image = request.file;

                if (!name || !category_id || !image) {
                    if(!image) {
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
        }
    } catch (error) {
        callBack({
            status: false,
            message: "Something went wrong. Please try again later.",
        });
        console.log(error);
    }
};

module.exports = {
    getSubRestaurantCategoryController: getSubRestaurantCategory,
    createSubRestaurantCategoryController: createSubRestaurantCategory,
};
