const { getRestaurantMainMenuModel, listAvailableRestaurantsModel } = require("./model");
const { resultObject, verify, processTableEncryptedKey, getRestaurantLocation } = require("../../helpers/common");
const { DatabaseError } = require("../../errors/customErrors");
const { isWithinRange } = require("../../helpers/geoUtils");
const { v4: uuidv4 } = require("uuid");
const { executeQuery } = require("../../helpers/db");

const getRestaurantMainMenu = async (request, callBack) => {
    try {
        const { key, latitude, longitude } = request.query;

        if (!latitude || !longitude) {
            callBack(resultObject(false, "Please provide the latitude and the longitude!"));
            return;
        }

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

        if (!isWithinRange(latitude, longitude, restaurantLocation, 20000000)) {
            callBack(resultObject(false, "Menu only available within restaurant."));
            return;
        }

        const result = await getRestaurantMainMenuModel(restaurant_id, number);

        if (result) {
            // Get session ID from cookies if it exists
            let sessionId = request.query.sessionId || request.cookies.cartSessionId;
            let needsNewSession = true;

            // Check if the session exists and is still valid
            if (sessionId) {
                const checkSessionQuery = `
                    SELECT id, updated_at 
                    FROM carts 
                    WHERE session_id = ? AND table_id = ? AND restaurant_id = ?
                `;

                const sessionResult = await executeQuery(checkSessionQuery, [sessionId, number, restaurant_id]);

                if (sessionResult && sessionResult.length > 0) {
                    const sessionData = sessionResult[0];
                    const updatedAt = new Date(sessionData.updated_at);
                    const currentTime = new Date();

                    // Check if session hasn't expired (2 hours = 7200000 milliseconds)
                    const sessionAge = currentTime - updatedAt;
                    if (sessionAge < 7200000) {
                        needsNewSession = false;

                        // Update the timestamp to extend the session
                        const updateTimestampQuery = `
                            UPDATE carts 
                            SET updated_at = CURRENT_TIMESTAMP 
                            WHERE session_id = ?
                        `;
                        await executeQuery(updateTimestampQuery, [sessionId]);
                    }
                }
            }

            // Create a new session if needed
            if (needsNewSession) {
                sessionId = uuidv4();

                // Create a new cart entry or update existing one
                const upsertCartQuery = `
                    INSERT INTO carts (table_id, restaurant_id, session_id)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE 
                    table_id = VALUES(table_id), 
                    restaurant_id = VALUES(restaurant_id),
                    updated_at = CURRENT_TIMESTAMP
                `;

                await executeQuery(upsertCartQuery, [number, restaurant_id, sessionId]);

                // Set the cookie in the response
                if (request.res) {
                    request.res.cookie("cartSessionId", sessionId, {
                        maxAge: 2 * 60 * 60 * 1000,
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                    });
                }
            }

            // Add the session ID to the response
            callBack(
                resultObject(true, "success", {
                    ...result,
                    sessionId,
                })
            );
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
