const { getInventoryItemsModel, getInventoryItemsByRestaurantIDModel, createInventoryItemModel } = require("./model");
const { resultObject, verify, processTableEncryptedKey } = require("../../helpers/common");

const getInventoryItems = async (request, callBack) => {
    try {
        const authorize = await verify(request?.headers["jwt"]);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        }

        if (authorize?.roles?.includes(1)) { // Assuming role 1 has permission to view inventory
            const result = await getInventoryItemsModel();

            if (result) {
                callBack(resultObject(true, "success", result));
            } else {
                callBack(resultObject(false, "Could not get inventory items."));
            }
        } else {
            callBack(resultObject(false, "You don't have permission to view inventory items!"));
        }
    } catch (error) {
        callBack({
            status: false,
            message: "Something went wrong. Please try again later.",
        });
        console.log(error);
    }
};

const getInventoryItemsByRestaurantID  = async (request, callBack) => {
    try {
        const authorize = await verify(request?.headers["jwt"]);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        }

        const { restaurant_id } = request.params;

        if (authorize?.roles?.includes(1)) { // Assuming role 1 has permission to view inventory
            const result = await getInventoryItemsByRestaurantIDModel(restaurant_id);

            if (result) {
                callBack(resultObject(true, "success", result));
            } else {
                callBack(resultObject(false, "Could not get inventory items."));
            }
        } else {
            callBack(resultObject(false, "You don't have permission to view inventory items!"));
        }
    } catch (error) {
        callBack({
            status: false,
            message: "Something went wrong. Please try again later.",
        });
        console.log(error);
    }
};

const createInventoryItem = async (request, callBack) => {
    try {
        const authorize = await verify(request?.headers["jwt"]);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        } else {
            if (authorize?.roles?.includes(1)) {  // Assuming role 1 is admin or has permission to create inventory items
                const { restaurant_id, name, quantity, unit_id, threshold, price, currency_id } = request.body;

                if (!restaurant_id || !name || !quantity || !unit_id || !price || !currency_id) {
                    callBack(resultObject(false, "Missing required fields"));
                    return;
                }

                const itemData = {
                    restaurant_id,
                    name,
                    quantity,
                    unit_id,
                    threshold,
                    price,
                    currency_id,
                    created_by: authorize.id
                };

                const result = await createInventoryItemModel(itemData);

                if (result) {
                    callBack(resultObject(true, "Inventory item created successfully", { id: result }));
                } else {
                    callBack(resultObject(false, "Could not create inventory item."));
                }
            } else {
                callBack(resultObject(false, "You don't have the permission to create inventory items!"));
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
    getInventoryItemsController: getInventoryItems,
    getInventoryItemsByRestaurantIDController: getInventoryItemsByRestaurantID,
    createInventoryItemController: createInventoryItem,
};

