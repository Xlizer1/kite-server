const { executeQuery } = require("../../../helpers/db");
const { resultObject } = require("../../../helpers/common");

// Get cart by session ID
const getCartModel = async (sessionId) => {
    try {
        const cartQuery = `
            SELECT 
                c.id, 
                c.table_id, 
                c.restaurant_id, 
                c.session_id, 
                c.created_at, 
                c.updated_at,
                t.number as table_number,
                t.name as table_name,
                r.name as restaurant_name
            FROM carts c
            JOIN tables t ON c.table_id = t.id
            JOIN restaurants r ON c.restaurant_id = r.id
            WHERE c.session_id = ?
        `;

        const cart = await executeQuery(cartQuery, [sessionId]);

        if (cart && cart.length > 0) {
            const cartItemsQuery = `
                SELECT 
                    ci.id, 
                    ci.item_id, 
                    ci.quantity, 
                    ci.special_instructions, 
                    i.name as item_name, 
                    i.price, 
                    i.description,
                    curr.code as currency_code,
                    (SELECT url FROM images img 
                        JOIN items_image_map iim ON img.id = iim.image_id 
                        WHERE iim.item_id = i.id AND iim.is_primary = 1 
                        LIMIT 1) as image_url,
                    (i.price * ci.quantity) as total_price
                FROM cart_items ci
                JOIN items i ON ci.item_id = i.id
                LEFT JOIN currencies curr ON i.currency_id = curr.id
                WHERE ci.cart_id = ?
            `;

            const cartItems = await executeQuery(cartItemsQuery, [cart[0].id]);

            // Calculate totals
            const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

            return {
                ...cart[0],
                items: cartItems || [],
                subtotal: subtotal,
                item_count: itemCount,
                currency_code: cartItems[0]?.currency_code || "USD",
            };
        }

        return null;
    } catch (error) {
        console.error("Error in getCartModel:", error);
        return null;
    }
};

// Create or update cart
// const upsertCartModel = async ({ tableId, restaurantId, sessionId }) => {
//   try {
//     // Check if cart exists
//     const existingCartQuery = `
//       SELECT id FROM carts WHERE session_id = ?
//     `;

//     const existingCart = await executeQuery(existingCartQuery, [sessionId]);

//     if (existingCart && existingCart.length > 0) {
//       // Update existing cart
//       const updateCartQuery = `
//         UPDATE carts
//         SET table_id = ?, restaurant_id = ?, updated_at = CURRENT_TIMESTAMP
//         WHERE session_id = ?
//       `;

//       await executeQuery(updateCartQuery, [tableId, restaurantId, sessionId]);
//       return { id: existingCart[0].id, status: true };
//     } else {
//       // Create new cart
//       const createCartQuery = `
//         INSERT INTO carts (table_id, restaurant_id, session_id)
//         VALUES (?, ?, ?)
//       `;

//       const result = await executeQuery(createCartQuery, [tableId, restaurantId, sessionId]);

//       if (result && result.insertId) {
//         return { id: result.insertId, status: true };
//       }
//     }

//     return { status: false, message: "Failed to create or update cart" };
//   } catch (error) {
//     console.error("Error in upsertCartModel:", error);
//     return { status: false, message: "An error occurred while processing your request" };
//   }
// };

// Add item to cart
const addCartItemModel = async ({ cartId, itemId, quantity, specialInstructions }) => {
    try {
        // First validate the cart exists and get restaurant info
        const cartValidationQuery = `
            SELECT c.restaurant_id 
            FROM carts c 
            WHERE c.id = ?
        `;
        const cartResult = await executeQuery(cartValidationQuery, [cartId]);

        if (!cartResult || cartResult.length === 0) {
            return { status: false, message: "Cart not found" };
        }

        // Validate item exists and belongs to same restaurant
        const itemValidationQuery = `
            SELECT i.restaurant_id, i.price 
            FROM items i 
            WHERE i.id = ? AND i.deleted_at IS NULL
        `;
        const itemResult = await executeQuery(itemValidationQuery, [itemId]);

        if (!itemResult || itemResult.length === 0) {
            return { status: false, message: "Item not found" };
        }

        if (itemResult[0].restaurant_id !== cartResult[0].restaurant_id) {
            return { status: false, message: "Item does not belong to this restaurant" };
        }

        // Check if item already exists in cart
        const existingItemQuery = `
            SELECT id, quantity FROM cart_items WHERE cart_id = ? AND item_id = ?
        `;

        const existingItem = await executeQuery(existingItemQuery, [cartId, itemId]);

        if (existingItem && existingItem.length > 0) {
            // Update quantity of existing item
            const newQuantity = existingItem[0].quantity + quantity;

            const updateItemQuery = `
                UPDATE cart_items 
                SET quantity = ?, special_instructions = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            `;

            await executeQuery(updateItemQuery, [newQuantity, specialInstructions, existingItem[0].id]);
            return { id: existingItem[0].id, status: true };
        } else {
            // Add new item to cart
            const addItemQuery = `
                INSERT INTO cart_items (cart_id, item_id, quantity, special_instructions)
                VALUES (?, ?, ?, ?)
            `;

            const result = await executeQuery(addItemQuery, [cartId, itemId, quantity, specialInstructions]);

            if (result && result.insertId) {
                return { id: result.insertId, status: true };
            }
        }

        return { status: false, message: "Failed to add item to cart" };
    } catch (error) {
        console.error("Error in addCartItemModel:", error);
        return { status: false, message: "An error occurred while processing your request" };
    }
};

// Update cart item quantity
const updateCartItemModel = async ({ cartItemId, quantity, specialInstructions }) => {
    try {
        const updateItemQuery = `
      UPDATE cart_items 
      SET quantity = ?, special_instructions = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

        await executeQuery(updateItemQuery, [quantity, specialInstructions, cartItemId]);
        return { status: true };
    } catch (error) {
        console.error("Error in updateCartItemModel:", error);
        return { status: false, message: "An error occurred while processing your request" };
    }
};

// Remove item from cart
const removeCartItemModel = async (cartItemId) => {
    try {
        const removeItemQuery = `
      DELETE FROM cart_items WHERE id = ?
    `;

        await executeQuery(removeItemQuery, [cartItemId]);
        return { status: true };
    } catch (error) {
        console.error("Error in removeCartItemModel:", error);
        return { status: false, message: "An error occurred while processing your request" };
    }
};

// Clear cart
const clearCartModel = async (cartId) => {
    try {
        const clearCartQuery = `
      DELETE FROM cart_items WHERE cart_id = ?
    `;

        await executeQuery(clearCartQuery, [cartId]);
        return { status: true };
    } catch (error) {
        console.error("Error in clearCartModel:", error);
        return { status: false, message: "An error occurred while processing your request" };
    }
};

// Create captain call
const createCaptainCallModel = async ({ tableId, restaurantId }) => {
    try {
        // Check if there's an active call for this table
        const existingCallQuery = `
      SELECT id FROM captain_calls 
      WHERE table_id = ? AND restaurant_id = ? AND status IN ('pending', 'in_progress')
    `;

        const existingCall = await executeQuery(existingCallQuery, [tableId, restaurantId]);

        if (existingCall && existingCall.length > 0) {
            return { id: existingCall[0].id, status: true, message: "Captain has already been called" };
        }

        const createCallQuery = `
      INSERT INTO captain_calls (table_id, restaurant_id, status)
      VALUES (?, ?, 'pending')
    `;

        const result = await executeQuery(createCallQuery, [tableId, restaurantId]);

        if (result && result.insertId) {
            return { id: result.insertId, status: true, message: "Captain has been called" };
        }

        return { status: false, message: "Failed to call captain" };
    } catch (error) {
        console.error("Error in createCaptainCallModel:", error);
        return { status: false, message: "An error occurred while processing your request" };
    }
};

// Get captain calls for restaurant
const getCaptainCallsModel = async (restaurantId) => {
    try {
        const callsQuery = `
            SELECT 
                cc.id, 
                cc.table_id, 
                cc.restaurant_id, 
                cc.status, 
                cc.created_at, 
                cc.updated_at, 
                t.number as table_number
            FROM 
                captain_calls cc
            JOIN 
                tables t ON cc.table_id = t.id
            WHERE 
                cc.restaurant_id = ? 
            AND 
                cc.status IN ('pending', 'in_progress')
            ORDER BY 
                cc.created_at ASC
        `;

        const calls = await executeQuery(callsQuery, [restaurantId]);
        return calls || [];
    } catch (error) {
        console.error("Error in getCaptainCallsModel:", error);
        return [];
    }
};

// Update captain call status
const updateCaptainCallModel = async ({ callId, status, userId }) => {
    try {
        let updateCallQuery;
        let params;

        if (status === "completed" || status === "cancelled") {
            updateCallQuery = `
        UPDATE captain_calls 
        SET status = ?, completed_at = CURRENT_TIMESTAMP, completed_by = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
            params = [status, userId, callId];
        } else {
            updateCallQuery = `
        UPDATE captain_calls 
        SET status = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `;
            params = [status, callId];
        }

        await executeQuery(updateCallQuery, params);
        return { status: true };
    } catch (error) {
        console.error("Error in updateCaptainCallModel:", error);
        return { status: false, message: "An error occurred while processing your request" };
    }
};

// Create order from cart
const createOrderFromCartModel = async ({ cartId, userId }) => {
    try {
        // Get cart details
        const cartQuery = `
      SELECT c.id, c.table_id, c.restaurant_id
      FROM carts c
      WHERE c.id = ?
    `;

        const cart = await executeQuery(cartQuery, [cartId]);

        if (!cart || cart.length === 0) {
            return { status: false, message: "Cart not found" };
        }

        // Create order
        const createOrderQuery = `
      INSERT INTO orders (table_id, restaurant_id, status_id, created_by)
      VALUES (?, ?, 1, ?)
    `;

        const orderResult = await executeQuery(createOrderQuery, [cart[0].table_id, cart[0].restaurant_id, userId]);

        if (!orderResult || !orderResult.insertId) {
            return { status: false, message: "Failed to create order" };
        }

        const orderId = orderResult.insertId;

        // Get cart items
        const cartItemsQuery = `
      SELECT item_id, quantity
      FROM cart_items
      WHERE cart_id = ?
    `;

        const cartItems = await executeQuery(cartItemsQuery, [cartId]);

        if (!cartItems || cartItems.length === 0) {
            return { status: false, message: "No items in cart" };
        }

        // Add items to order
        for (const item of cartItems) {
            const addOrderItemQuery = `
        INSERT INTO order_items (order_id, item_id, quantity)
        VALUES (?, ?, ?)
      `;

            await executeQuery(addOrderItemQuery, [orderId, item.item_id, item.quantity]);
        }

        // Clear cart
        await clearCartModel(cartId);

        return {
            status: true,
            message: "Order created successfully",
            orderId,
        };
    } catch (error) {
        console.error("Error in createOrderFromCartModel:", error);
        return { status: false, message: "An error occurred while processing your request" };
    }
};

/**
 * Place order from cart (Customer-facing)
 * @param {Object} data - Order data
 * @returns {Promise<Object>} - Order result
 */
const placeOrderFromCartModel = async (data) => {
    try {
        const { sessionId, cartId, tableId, restaurantId, special_request, allergy_info, customer_name } = data;

        // Validate cart exists and has items
        const cartItemsQuery = `
            SELECT 
                ci.id,
                ci.item_id,
                ci.quantity,
                ci.special_instructions,
                i.price,
                i.name as item_name
            FROM cart_items ci
            JOIN items i ON ci.item_id = i.id
            WHERE ci.cart_id = ?
        `;

        const cartItems = await executeQuery(cartItemsQuery, [cartId], "getCartItemsForOrder");

        if (!cartItems || cartItems.length === 0) {
            return { status: false, message: "Cart is empty" };
        }

        // Calculate total amount
        const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Create order with status 1 (Pending - waiting for captain approval)
        const createOrderQuery = `
            INSERT INTO orders (
                table_id, 
                restaurant_id, 
                status_id, 
                special_request, 
                allergy_info, 
                customer_name,
                total_amount,
                created_at
            ) VALUES (?, ?, 1, ?, ?, ?, ?, NOW())
        `;

        const orderResult = await executeQuery(
            createOrderQuery,
            [tableId, restaurantId, special_request, allergy_info, customer_name, totalAmount],
            "createCustomerOrder"
        );

        if (!orderResult || !orderResult.insertId) {
            return { status: false, message: "Failed to create order" };
        }

        const orderId = orderResult.insertId;

        // Transfer cart items to order items
        for (const item of cartItems) {
            const addOrderItemQuery = `
                INSERT INTO order_items (
                    order_id, 
                    item_id, 
                    quantity, 
                    special_instructions,
                    unit_price,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, NOW())
            `;

            await executeQuery(
                addOrderItemQuery,
                [orderId, item.item_id, item.quantity, item.special_instructions, item.price],
                "addOrderItem"
            );
        }

        // Record initial order status in history
        const statusHistoryQuery = `
            INSERT INTO order_status_history (
                order_id, 
                status_id, 
                notes, 
                created_at
            ) VALUES (?, 1, 'Order placed by customer', NOW())
        `;

        await executeQuery(statusHistoryQuery, [orderId], "recordOrderStatusHistory");

        // Clear the cart after successful order creation
        await executeQuery("DELETE FROM cart_items WHERE cart_id = ?", [cartId], "clearCartAfterOrder");
        await executeQuery("DELETE FROM carts WHERE id = ?", [cartId], "deleteCartAfterOrder");

        console.log(`✅ Customer order created: Order #${orderId}, Table ${tableId}, ${cartItems.length} items`);

        return {
            status: true,
            orderId: orderId,
            itemsCount: cartItems.length,
            totalAmount: totalAmount,
            message: "Order placed successfully",
        };
    } catch (error) {
        console.error("Error in placeOrderFromCartModel:", error);
        return { status: false, message: "An error occurred while placing your order" };
    }
};

module.exports = {
    getCartModel,
    placeOrderFromCartModel,
    addCartItemModel,
    updateCartItemModel,
    removeCartItemModel,
    clearCartModel,
    createCaptainCallModel,
    getCaptainCallsModel,
    updateCaptainCallModel,
    createOrderFromCartModel,
};
