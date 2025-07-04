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
const { executeQuery, executeTransaction } = require("../../../helpers/db");
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

        // ✅ CHANGE 1: Make location range configurable
        const locationRange = process.env.LOCATION_RANGE_METERS || 1000000;
        if (!isWithinRange(latitude, longitude, restaurantLocation, locationRange)) {
            callBack(resultObject(false, "Menu only available within restaurant premises."));
            return;
        }

        // ✅ CHANGE 2: Get table ID early and use it consistently
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

        const result = await getRestaurantMainMenuModel(restaurant_id, number);

        if (result) {
            let sessionId = request.query.sessionId || request.cookies.cartSessionId;
            let needsNewSession = true;

            // ✅ CHANGE 3: Add session sharing logic - check if table already has an active session
            const checkTableSessionQuery = `
                SELECT c.id, c.session_id, c.updated_at, c.table_id, c.restaurant_id
                FROM carts c 
                WHERE c.table_id = ? AND c.restaurant_id = ?
                ORDER BY c.updated_at DESC
                LIMIT 1
            `;
            const tableSessionResult = await executeQuery(checkTableSessionQuery, [tableId, restaurant_id]);

            if (tableSessionResult && tableSessionResult.length > 0) {
                // Table already has an active session - use it (enables session sharing)
                const existingSession = tableSessionResult[0];
                sessionId = existingSession.session_id;
                needsNewSession = false;

                // Update activity timestamp
                const updateTimestampQuery = `
                    UPDATE carts 
                    SET updated_at = CURRENT_TIMESTAMP 
                    WHERE session_id = ?
                `;
                await executeQuery(updateTimestampQuery, [sessionId]);

                console.log(`✅ Using existing session ${sessionId} for Table ${number}`);
            } else if (sessionId) {
                // ✅ CHANGE 4: Fix the session check query to use tableId instead of number
                const checkSessionQuery = `
                    SELECT c.id, c.updated_at, c.table_id, c.restaurant_id
                    FROM carts c 
                    WHERE c.session_id = ? AND c.table_id = ? AND c.restaurant_id = ?
                `;

                const sessionResult = await executeQuery(checkSessionQuery, [sessionId, tableId, restaurant_id]);
                // ↑ CHANGED: Use tableId instead of number

                if (sessionResult && sessionResult.length > 0) {
                    needsNewSession = false;

                    // Update activity timestamp
                    const updateTimestampQuery = `
                        UPDATE carts 
                        SET updated_at = CURRENT_TIMESTAMP 
                        WHERE session_id = ?
                    `;
                    await executeQuery(updateTimestampQuery, [sessionId]);

                    console.log(`✅ Reusing valid session ${sessionId} for Table ${number}`);
                }
            }

            // Create new session only if no valid session exists
            if (needsNewSession) {
                sessionId = uuidv4();

                // ✅ CHANGE 5: Use transaction to prevent race conditions (optional but recommended)
                try {
                    const queries = [];

                    // Create new cart
                    queries.push({
                        sql: `
                            INSERT INTO carts (table_id, restaurant_id, session_id, created_at, updated_at)
                            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                        `,
                        params: [tableId, restaurant_id, sessionId],
                    });

                    // Update table status to occupied
                    queries.push({
                        sql: `
                            UPDATE tables
                            SET status = 'occupied', 
                                customer_count = 1, 
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = ? AND restaurant_id = ?
                        `,
                        params: [tableId, restaurant_id],
                    });

                    await executeTransaction(queries, "createNewTableSession");

                    console.log(`🆕 Created new session ${sessionId} for Table ${number}`);
                } catch (error) {
                    console.error("Error creating new session:", error);
                    callBack(resultObject(false, "Failed to create session. Please try again."));
                    return;
                }

                // ✅ CHANGE 6: Add sameSite attribute to cookie for better security
                if (request.res) {
                    request.res.cookie("cartSessionId", sessionId, {
                        maxAge: 24 * 60 * 60 * 1000, // 24 hours (safety net)
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax", // Added for better security
                    });
                }
            } else {
                // ✅ CHANGE 7: Set cookie for existing sessions too
                if (request.res) {
                    request.res.cookie("cartSessionId", sessionId, {
                        maxAge: 24 * 60 * 60 * 1000,
                        httpOnly: true,
                        secure: process.env.NODE_ENV === "production",
                        sameSite: "lax",
                    });
                }
            }

            callBack(
                resultObject(true, "success", {
                    ...result,
                    sessionId,
                    // ✅ CHANGE 8: Include additional useful info in response
                    tableId,
                    tableNumber: number,
                    restaurantId: restaurant_id,
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
