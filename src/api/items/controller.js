const { getItemsModel, getItemsBySubCategoryIDModel, createItemModel } = require("./model");
const { resultObject, verify, processTableEncryptedKey, checkSubCategoryForRestaurant } = require("../../helpers/common");

const getItems = async (request, callBack) => {
    try {
        const { key } = request.query;

        if (!key || typeof key !== "string") {
            callBack(resultObject(false, "Invalid key!"));
            return;
        }

        const { restaurant_id } = await processTableEncryptedKey(key);

        const result = await getItemsModel(restaurant_id);

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

const getItemsBySubCategoryID = async (request, callBack) => {
    try {
        const { sub_cat_id, key } = request.query;

        if (!sub_cat_id || !key || typeof key !== "string") {
            callBack(resultObject(false, "Invalid sub category id or key!"));
            return;
        }

        const { restaurant_id } = await processTableEncryptedKey(key);

        if (!(await checkSubCategoryForRestaurant(restaurant_id, sub_cat_id))) {
            callBack(resultObject(false, "Invalid category or restaurant."));
            return;
        }

        const result = await getItemsBySubCategoryIDModel(restaurant_id, sub_cat_id);

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

const createItem = async (request, callBack) => {
    try {
        const authorize = await verify(request?.headers["jwt"]);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        } else {
            if (authorize?.roles?.includes(1)) {
                const { restaurant_id, sub_category_id, name, description, price, is_shisha } = request.body;
                const image = request.file;
                const result = await createItemModel({ restaurant_id, sub_category_id, name, description, price, is_shisha, images: [image], creator_id: authorize?.id });
                if (result) {
                    callBack(resultObject(true, "success"));
                } else {
                    callBack(resultObject(false, "Couldn't create item."));
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
    getItemsController: getItems,
    getItemsBySubCategoryIDController: getItemsBySubCategoryID,
    createItemController: createItem,
};
