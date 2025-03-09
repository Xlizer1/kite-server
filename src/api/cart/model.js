const { executeQuery } = require("../../helpers/db");
const { resultObject } = require("../../helpers/common");

// Get cart by session ID
const getCartModel = async (sessionId) => {
  try {
    const cartQuery = `
      SELECT c.id, c.table_id, c.restaurant_id, c.session_id, c.created_at, c.updated_at
      FROM carts c
      WHERE c.session_id = ?
    `;
    
    const cart = await executeQuery(cartQuery, [sessionId]);
    
    if (cart && cart.length > 0) {
      const cartItemsQuery = `
        SELECT ci.id, ci.item_id, ci.quantity, ci.special_instructions, 
               i.name as item_name, i.price, i.description,
               (SELECT url FROM images img 
                JOIN items_image_map iim ON img.id = iim.image_id 
                WHERE iim.item_id = i.id AND iim.is_primary = 1 
                LIMIT 1) as image_url
        FROM cart_items ci
        JOIN items i ON ci.item_id = i.id
        WHERE ci.cart_id = ?
      `;
      
      const cartItems = await executeQuery(cartItemsQuery, [cart[0].id]);
      
      return {
        ...cart[0],
        items: cartItems || []
      };
    }
    
    return null;
  } catch (error) {
    console.error("Error in getCartModel:", error);
    return null;
  }
};

// Create or update cart
const upsertCartModel = async ({ tableId, restaurantId, sessionId }) => {
  try {
    // Check if cart exists
    const existingCartQuery = `
      SELECT id FROM carts WHERE session_id = ?
    `;
    
    const existingCart = await executeQuery(existingCartQuery, [sessionId]);
    
    if (existingCart && existingCart.length > 0) {
      // Update existing cart
      const updateCartQuery = `
        UPDATE carts 
        SET table_id = ?, restaurant_id = ?, updated_at = CURRENT_TIMESTAMP
        WHERE session_id = ?
      `;
      
      await executeQuery(updateCartQuery, [tableId, restaurantId, sessionId]);
      return { id: existingCart[0].id, status: true };
    } else {
      // Create new cart
      const createCartQuery = `
        INSERT INTO carts (table_id, restaurant_id, session_id)
        VALUES (?, ?, ?)
      `;
      
      const result = await executeQuery(createCartQuery, [tableId, restaurantId, sessionId]);
      
      if (result && result.insertId) {
        return { id: result.insertId, status: true };
      }
    }
    
    return { status: false, message: "Failed to create or update cart" };
  } catch (error) {
    console.error("Error in upsertCartModel:", error);
    return { status: false, message: "An error occurred while processing your request" };
  }
};

// Add item to cart
const addCartItemModel = async ({ cartId, itemId, quantity, specialInstructions }) => {
  try {
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
      SELECT cc.id, cc.table_id, cc.restaurant_id, cc.status, cc.created_at, cc.updated_at, 
             t.number as table_number
      FROM captain_calls cc
      JOIN tables t ON cc.table_id = t.id
      WHERE cc.restaurant_id = ? AND cc.status IN ('pending', 'in_progress')
      ORDER BY cc.created_at ASC
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
    
    if (status === 'completed' || status === 'cancelled') {
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
    
    const orderResult = await executeQuery(createOrderQuery, [
      cart[0].table_id, 
      cart[0].restaurant_id, 
      userId
    ]);
    
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
      orderId 
    };
  } catch (error) {
    console.error("Error in createOrderFromCartModel:", error);
    return { status: false, message: "An error occurred while processing your request" };
  }
};

module.exports = {
  getCartModel,
  upsertCartModel,
  addCartItemModel,
  updateCartItemModel,
  removeCartItemModel,
  clearCartModel,
  createCaptainCallModel,
  getCaptainCallsModel,
  updateCaptainCallModel,
  createOrderFromCartModel
};
