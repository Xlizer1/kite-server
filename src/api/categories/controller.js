const { createRestaurantCategoryModel } = require("./model");
const { resultObject, verify, processTableEncryptedKey } = require("../../helpers/common");

const createRestaurantCategory = async (request, callBack) => {
    try {
        const authorize = await verify(request?.headers["jwt"]);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        } else {
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
    createRestaurantCategoryController: createRestaurantCategory,
};
