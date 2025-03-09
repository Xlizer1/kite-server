const { getRestaurantMainMenuModel, listAvailableRestaurantsModel } = require("./model");
const { resultObject, verify, processTableEncryptedKey, getRestaurantLocation } = require("../../helpers/common");
const { DatabaseError } = require("../../errors/customErrors");
const { isWithinRange } = require("../../helpers/geoUtils");

const getRestaurantMainMenu = async (request, callBack) => {
    try {
        const { key } = request.query;
        const { latitude, longitude } = request.body;

        if (!key || typeof key !== "string") {
            callBack(resultObject(false, "Please provide a key!"));
            return;
        }
        const { restaurant_id, number } = await processTableEncryptedKey(key);
        if (!number || !restaurant_id) {
            callBack(resultObject(false, "Invalid Table Key!"));
            return;
        }

        const restaurantLocation = await getRestaurantLocation(restaurant_id);

        if (!isWithinRange(latitude, longitude, restaurantLocation, 2000000)) {
            callBack(resultObject(false, "Menu only available within restaurant."));
            return;
        }

        const result = await getRestaurantMainMenuModel(restaurant_id, number);

        if (result) {
            callBack(resultObject(true, "success", result));
        } else {
            callBack(resultObject(false, "Restaurant not found."));
        }
    } catch (error) {
        console.error("Error in getRestaurantMainMenu:", error);

        if (error instanceof DatabaseError) {
            callBack(resultObject(false, error.message));
            return;
        }

        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

const listAvailableRestaurants = async (request, callBack) => {
    try {
        const restaurants = await listAvailableRestaurantsModel();
        callBack(resultObject(true, "success", restaurants));
    } catch (error) {
        console.error("Error in listAvailableRestaurants:", error);
        callBack(resultObject(false, "Failed to fetch available restaurants"));
    }
};

const getCartItems = async () => {};

module.exports = {
    getRestaurantMainMenuController: getRestaurantMainMenu,
    listAvailableRestaurantsController: listAvailableRestaurants,
    getCartItemsController: getCartItems,
};
