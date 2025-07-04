const { getRestaurantMainMenuModel, listAvailableRestaurantsModel, getRestaurantCategoryModel } = require("./model");
const {
    resultObject,
    verifyUserToken,
    processTableEncryptedKey,
    getRestaurantLocation,
} = require("../../../helpers/common");
const { DatabaseError } = require("../../../errors/customErrors");
const { isWithinRange } = require("../../../helpers/geoUtils");
const { v4: uuidv4 } = require("uuid");
const { executeQuery } = require("../../../helpers/db");
const { CustomError } = require("../../../middleware/errorHandler");

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

        // ✅ Location validation (100m range)
        if (!isWithinRange(latitude, longitude, restaurantLocation, 100)) {
            callBack(resultObject(false, "Menu only available within restaurant premises."));
            return;
        }

        const result = await getRestaurantMainMenuModel(restaurant_id, number);

        if (result) {
            let sessionId = request.query.sessionId || request.cookies.cartSessionId;
            let needsNewSession = true;

            // Check if session exists and is still valid
            if (sessionId) {
                const checkSessionQuery = `
                    SELECT c.id, c.updated_at, c.table_id, c.restaurant_id
                    FROM carts c 
                    WHERE c.session_id = ? AND c.table_id = ? AND c.restaurant_id = ?
                `;

                const sessionResult = await executeQuery(checkSessionQuery, [sessionId, number, restaurant_id]);

                if (sessionResult && sessionResult.length > 0) {
                    // ✅ CHANGED: No 2-hour timeout check!
                    // Session is valid as long as it exists
                    needsNewSession = false;

                    // Update activity timestamp
                    const updateTimestampQuery = `
                        UPDATE carts 
                        SET updated_at = CURRENT_TIMESTAMP 
                        WHERE session_id = ?
                    `;
                    await executeQuery(updateTimestampQuery, [sessionId]);
                }
            }

            // Create new session only if no valid session exists
            if (needsNewSession) {
                sessionId = uuidv4();

                // Get table ID
                const getTableIdQuery = `
                    SELECT id FROM tables 
                    WHERE number = ? AND restaurant_id = ? AND deleted_at IS NULL
                `;
                const tableResult = await executeQuery(getTableIdQuery, [number, restaurant_id]);

                if (!tableResult || tableResult.length === 0) {
                    callBack(resultObject(false, "Table not found"));
                    return;
                }

                const tableId = tableResult[0].id;

                // Create new cart
                const createCartQuery = `
                    INSERT INTO carts (table_id, restaurant_id, session_id, created_at, updated_at)
                    VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                `;
                await executeQuery(createCartQuery, [tableId, restaurant_id, sessionId]);

                // ✅ FIXED: Update specific table status
                const updateTableStatusQuery = `
                    UPDATE tables
                    SET status = 'occupied', 
                        customer_count = 1, 
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? AND restaurant_id = ?
                `;
                await executeQuery(updateTableStatusQuery, [tableId, restaurant_id]);

                // Set cookie (longer expiry since no aggressive timeout)
                if (request.res) {
                    request.res.cookie("cartSessionId", sessionId, {
                        maxAge: 24 * 60 * 60 * 1000, // 24 hours (safety net)
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                    });
                }
            }

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

const getCategories = async (request, callBack) => {
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

module.exports = {
    getRestaurantMainMenuController: getRestaurantMainMenu,
    listAvailableRestaurantsController: listAvailableRestaurants,
    getCategoriesController: getCategories,
};
