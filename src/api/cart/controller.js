const {
    getCartModel,
    upsertCartModel,
    addCartItemModel,
    updateCartItemModel,
    removeCartItemModel,
    clearCartModel,
    createCaptainCallModel,
    getCaptainCallsModel,
    updateCaptainCallModel,
    createOrderFromCartModel,
} = require("./model");
const { resultObject, verify, processTableEncryptedKey } = require("../../helpers/common");
const { v4: uuidv4 } = require("uuid");
const { executeQuery } = require("../../helpers/db");

// Helper function to calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance;
};

// Get cart by session ID
const getCart = async (request, callBack) => {
    try {
        const sessionId = request.query.sessionId || request.cookies.cartSessionId;

        if (!sessionId) {
            return callBack(resultObject(false, "Session ID is required"));
        }

        const cart = await getCartModel(sessionId);

        if (cart) {
            return callBack(resultObject(true, "Cart retrieved successfully", cart));
        } else {
            return callBack(resultObject(true, "Cart is empty", { items: [] }));
        }
    } catch (error) {
        console.error("Error in getCart controller:", error);
        return callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

// Initialize cart
const initializeCart = async (request, callBack) => {
    try {
        const { key, latitude, longitude } = request.body;

        if (!key) {
            return callBack(resultObject(false, "Encrypted key is required"));
        }

        // Process the encrypted key to get table_id and restaurant_id
        const tableData = await processTableEncryptedKey(key);

        if (!tableData || !tableData.table_id || !tableData.restaurant_id) {
            return callBack(resultObject(false, "Invalid encrypted key"));
        }

        const tableId = tableData.table_id;
        const restaurantId = tableData.restaurant_id;

        // Verify restaurant location if coordinates are provided
        if (latitude && longitude) {
            // Get restaurant coordinates
            const restaurantQuery = `
              SELECT lat, \`long\` FROM restaurants WHERE id = ?
            `;

            const restaurant = await executeQuery(restaurantQuery, [restaurantId]);

            if (!restaurant || restaurant.length === 0) {
                return callBack(resultObject(false, "Restaurant not found"));
            }

            // Calculate distance between user and restaurant (using Haversine formula)
            const distance = calculateDistance(latitude, longitude, restaurant[0].lat, restaurant[0].long);

            // If distance is greater than 100 meters (can be adjusted as needed)
            if (distance > 0.1) {
                return callBack(resultObject(false, "You must be at the restaurant to access the menu"));
            }
        }

        // Generate session ID if not provided
        let sessionId = request.cookies.cartSessionId;
        if (!sessionId) {
            sessionId = uuidv4();
        }

        const result = await upsertCartModel({ tableId, restaurantId, sessionId });

        if (result.status) {
            // Set cookie with session ID
            if (!request.cookies.cartSessionId) {
                request.res.cookie("cartSessionId", sessionId, {
                    maxAge: 2 * 60 * 60 * 1000, // 24 hours
                    httpOnly: true,
                    secure: process.env.NODE_ENV === "production",
                });
            }

            return callBack(
                resultObject(true, "Cart initialized successfully", {
                    cartId: result.id,
                    sessionId,
                    tableId,
                    restaurantId,
                })
            );
        } else {
            return callBack(resultObject(false, result.message || "Failed to initialize cart"));
        }
    } catch (error) {
        console.error("Error in initializeCart controller:", error);
        return callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

// Add item to cart
const addCartItem = async (request, callBack) => {
    try {
        const { itemId, quantity = 1, specialInstructions } = request.body;
        const sessionId = request.query.sessionId || request.cookies.cartSessionId;

        if (!sessionId) {
            return callBack(resultObject(false, "Session ID is required"));
        }

        if (!itemId) {
            return callBack(resultObject(false, "Item ID is required"));
        }

        // Get cart ID
        const cart = await getCartModel(sessionId);

        if (!cart) {
            return callBack(resultObject(false, "Cart not found. Please initialize cart first"));
        }

        const result = await addCartItemModel({
            cartId: cart.id,
            itemId,
            quantity,
            specialInstructions,
        });

        if (result.status) {
            // Get updated cart
            const updatedCart = await getCartModel(sessionId);
            return callBack(resultObject(true, "Item added to cart successfully", updatedCart));
        } else {
            return callBack(resultObject(false, result.message || "Failed to add item to cart"));
        }
    } catch (error) {
        console.error("Error in addCartItem controller:", error);
        return callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

// Update cart item
const updateCartItem = async (request, callBack) => {
    try {
        const { cartItemId } = request.params;
        const { quantity, specialInstructions } = request.body;
        const sessionId = request.query.sessionId || request.cookies.cartSessionId;

        if (!sessionId) {
            return callBack(resultObject(false, "Session ID is required"));
        }

        if (!cartItemId) {
            return callBack(resultObject(false, "Cart Item ID is required"));
        }

        if (quantity <= 0) {
            // If quantity is 0 or negative, remove item from cart
            const removeResult = await removeCartItemModel(cartItemId);

            if (removeResult.status) {
                // Get updated cart
                const updatedCart = await getCartModel(sessionId);
                return callBack(resultObject(true, "Item removed from cart successfully", updatedCart));
            } else {
                return callBack(resultObject(false, removeResult.message || "Failed to remove item from cart"));
            }
        } else {
            // Update item quantity
            const result = await updateCartItemModel({
                cartItemId,
                quantity,
                specialInstructions,
            });

            if (result.status) {
                // Get updated cart
                const updatedCart = await getCartModel(sessionId);
                return callBack(resultObject(true, "Cart item updated successfully", updatedCart));
            } else {
                return callBack(resultObject(false, result.message || "Failed to update cart item"));
            }
        }
    } catch (error) {
        console.error("Error in updateCartItem controller:", error);
        return callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

// Remove item from cart
const removeCartItem = async (request, callBack) => {
    try {
        const { cartItemId } = request.params;
        const sessionId = request.query.sessionId || request.cookies.cartSessionId;

        if (!sessionId) {
            return callBack(resultObject(false, "Session ID is required"));
        }

        if (!cartItemId) {
            return callBack(resultObject(false, "Cart Item ID is required"));
        }

        const result = await removeCartItemModel(cartItemId);

        if (result.status) {
            // Get updated cart
            const updatedCart = await getCartModel(sessionId);
            return callBack(resultObject(true, "Item removed from cart successfully", updatedCart));
        } else {
            return callBack(resultObject(false, result.message || "Failed to remove item from cart"));
        }
    } catch (error) {
        console.error("Error in removeCartItem controller:", error);
        return callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

// Clear cart
const clearCart = async (request, callBack) => {
    try {
        const sessionId = request.query.sessionId || request.cookies.cartSessionId;

        if (!sessionId) {
            return callBack(resultObject(false, "Session ID is required"));
        }

        // Get cart ID
        const cart = await getCartModel(sessionId);

        if (!cart) {
            return callBack(resultObject(false, "Cart not found"));
        }

        const result = await clearCartModel(cart.id);

        if (result.status) {
            return callBack(resultObject(true, "Cart cleared successfully", { items: [] }));
        } else {
            return callBack(resultObject(false, result.message || "Failed to clear cart"));
        }
    } catch (error) {
        console.error("Error in clearCart controller:", error);
        return callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

// Call captain
const callCaptain = async (request, callBack) => {
    try {
        const sessionId = request.query.sessionId || request.cookies.cartSessionId;

        if (!sessionId) {
            return callBack(resultObject(false, "Session ID is required"));
        }

        // Get cart details
        const cart = await getCartModel(sessionId);

        if (!cart || !cart.id) {
            return callBack(resultObject(false, "Cart not found. Please initialize cart first"));
        }

        if (!cart.items || cart.items.length === 0) {
            return callBack(resultObject(false, "Your cart is empty. Please add items before calling a captain"));
        }

        const result = await createCaptainCallModel({
            tableId: cart.table_id,
            restaurantId: cart.restaurant_id,
        });

        if (result.status) {
            return callBack(resultObject(true, result.message || "Captain has been called", { callId: result.id }));
        } else {
            return callBack(resultObject(false, result.message || "Failed to call captain"));
        }
    } catch (error) {
        console.error("Error in callCaptain controller:", error);
        return callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

// Get captain calls (for staff)
const getCaptainCalls = async (request, callBack) => {
    try {
        const authorize = await verify(request?.headers["jwt"]);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user has permission to view captain calls
        if (!authorize?.roles?.includes(1)) {
            return callBack(resultObject(false, "You don't have permission to view captain calls"));
        }

        const restaurantId = authorize.restaurant_id;

        if (!restaurantId) {
            return callBack(resultObject(false, "Restaurant ID is required"));
        }

        const calls = await getCaptainCallsModel(restaurantId);

        return callBack(resultObject(true, "Captain calls retrieved successfully", calls));
    } catch (error) {
        console.error("Error in getCaptainCalls controller:", error);
        return callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

// Update captain call status (for staff)
const updateCaptainCall = async (request, callBack) => {
    try {
        const authorize = await verify(request?.headers["jwt"]);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user has permission to update captain calls
        if (!authorize?.roles?.includes(1)) {
            return callBack(resultObject(false, "You don't have permission to update captain calls"));
        }

        const { callId } = request.params;
        const { status } = request.body;

        if (!callId) {
            return callBack(resultObject(false, "Call ID is required"));
        }

        if (!status || !["in_progress", "completed", "cancelled"].includes(status)) {
            return callBack(resultObject(false, "Valid status is required (in_progress, completed, cancelled)"));
        }

        const result = await updateCaptainCallModel({
            callId,
            status,
            userId: authorize.id,
        });

        if (result.status) {
            return callBack(resultObject(true, `Captain call marked as ${status}`));
        } else {
            return callBack(resultObject(false, result.message || "Failed to update captain call"));
        }
    } catch (error) {
        console.error("Error in updateCaptainCall controller:", error);
        return callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

// Create order from cart (for staff)
const createOrderFromCart = async (request, callBack) => {
    try {
        const authorize = await verify(request?.headers["jwt"]);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user has permission to create orders
        if (!authorize?.roles?.includes(1)) {
            return callBack(resultObject(false, "You don't have permission to create orders"));
        }

        const { cartId } = request.body;

        if (!cartId) {
            return callBack(resultObject(false, "Cart ID is required"));
        }

        const result = await createOrderFromCartModel({
            cartId,
            userId: authorize.id,
        });

        if (result.status) {
            return callBack(resultObject(true, result.message, { orderId: result.orderId }));
        } else {
            return callBack(resultObject(false, result.message || "Failed to create order"));
        }
    } catch (error) {
        console.error("Error in createOrderFromCart controller:", error);
        return callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

module.exports = {
    getCartController: getCart,
    initializeCartController: initializeCart,
    addCartItemController: addCartItem,
    updateCartItemController: updateCartItem,
    removeCartItemController: removeCartItem,
    clearCartController: clearCart,
    callCaptainController: callCaptain,
    getCaptainCallsController: getCaptainCalls,
    updateCaptainCallController: updateCaptainCall,
    createOrderFromCartController: createOrderFromCart,
};
