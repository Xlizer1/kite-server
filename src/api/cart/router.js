const express = require("express");
const {
  getCartController,
  initializeCartController,
  addCartItemController,
  updateCartItemController,
  removeCartItemController,
  clearCartController,
  callCaptainController,
  getCaptainCallsController,
  updateCaptainCallController,
  createOrderFromCartController
} = require("./controller");
const { cartSchema, cartItemSchema, captainCallSchema, createOrderSchema } = require("../../validators/cartValidator");
const validateRequest = require("../../middleware/validateRequest");

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The cart ID
 *         table_id:
 *           type: integer
 *           description: The table ID
 *         restaurant_id:
 *           type: integer
 *           description: The restaurant ID
 *         session_id:
 *           type: string
 *           description: Unique session identifier
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *     
 *     CartItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The cart item ID
 *         item_id:
 *           type: integer
 *           description: The menu item ID
 *         quantity:
 *           type: integer
 *           description: Quantity of the item
 *         special_instructions:
 *           type: string
 *           description: Special instructions for the item
 *         item_name:
 *           type: string
 *           description: Name of the menu item
 *         price:
 *           type: number
 *           description: Price of the menu item
 *         description:
 *           type: string
 *           description: Description of the menu item
 *         image_url:
 *           type: string
 *           description: URL of the item image
 *     
 *     CaptainCall:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The captain call ID
 *         table_id:
 *           type: integer
 *           description: The table ID
 *         restaurant_id:
 *           type: integer
 *           description: The restaurant ID
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *           description: Status of the captain call
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *   
 *   responses:
 *     Success:
 *       description: Operation successful
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: boolean
 *                 example: true
 *               message:
 *                 type: string
 *               data:
 *                 type: object
 *     
 *     Error:
 *       description: Operation failed
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: boolean
 *                 example: false
 *               message:
 *                 type: string
 */

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart management endpoints
 */

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get cart
 *     description: Retrieves the current cart based on session ID
 *     tags: [Cart]
 *     parameters:
 *       - in: query
 *         name: sessionId
 *         schema:
 *           type: string
 *         description: Session ID (optional, will use cookie if not provided)
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       500:
 *         $ref: '#/components/responses/Error'
 */
router.get("/", (req, res) => {
  getCartController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/cart/initialize:
 *   post:
 *     summary: Initialize cart
 *     description: Creates a new cart or updates an existing one
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *             properties:
 *               key:
 *                 type: string
 *                 description: Encrypted key containing table and restaurant information
 *               latitude:
 *                 type: number
 *                 description: User's latitude for location verification
 *               longitude:
 *                 type: number
 *                 description: User's longitude for location verification
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/Error'
 */
router.post("/initialize", validateRequest(cartSchema), (req, res) => {
  initializeCartController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/cart/items:
 *   post:
 *     summary: Add item to cart
 *     description: Adds an item to the cart
 *     tags: [Cart]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: integer
 *                 description: ID of the item to add
 *               quantity:
 *                 type: integer
 *                 default: 1
 *                 description: Number of items to add
 *               specialInstructions:
 *                 type: string
 *                 description: Special instructions for the item
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/Error'
 */
router.post("/items", validateRequest(cartItemSchema), (req, res) => {
  addCartItemController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/cart/items/{cartItemId}:
 *   put:
 *     summary: Update cart item
 *     description: Updates the quantity or special instructions for an item
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cart item to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 description: New quantity
 *               specialInstructions:
 *                 type: string
 *                 description: Updated special instructions
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/Error'
 */
router.put("/items/:cartItemId", validateRequest(cartItemSchema), (req, res) => {
  updateCartItemController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/cart/items/{cartItemId}:
 *   delete:
 *     summary: Remove item from cart
 *     description: Removes an item from the cart
 *     tags: [Cart]
 *     parameters:
 *       - in: path
 *         name: cartItemId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the cart item to remove
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/Error'
 */
router.delete("/items/:cartItemId", (req, res) => {
  removeCartItemController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear cart
 *     description: Removes all items from the cart
 *     tags: [Cart]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/Error'
 */
router.delete("/clear", (req, res) => {
  clearCartController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/cart/call-captain:
 *   post:
 *     summary: Call captain
 *     description: Requests a captain to verify the order
 *     tags: [Cart]
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/Error'
 */
router.post("/call-captain", (req, res) => {
  callCaptainController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Staff-facing endpoints
 */

/**
 * @swagger
 * /api/cart/captain-calls:
 *   get:
 *     summary: Get captain calls
 *     description: Retrieves all active captain calls for a restaurant
 *     tags: [Staff]
 *     parameters:
 *       - in: query
 *         name: restaurantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the restaurant to get calls for
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/Error'
 */
router.get("/captain-calls", (req, res) => {
  getCaptainCallsController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/cart/captain-calls/{callId}:
 *   put:
 *     summary: Update captain call
 *     description: Updates the status of a captain call
 *     tags: [Staff]
 *     parameters:
 *       - in: path
 *         name: callId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the captain call to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [in_progress, completed, cancelled]
 *                 description: New status
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/Error'
 */
router.put("/captain-calls/:callId", validateRequest(captainCallSchema), (req, res) => {
  updateCaptainCallController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/cart/create-order:
 *   post:
 *     summary: Create order from cart
 *     description: Converts the cart into an order
 *     tags: [Staff]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - cartId
 *             properties:
 *               cartId:
 *                 type: integer
 *                 description: ID of the cart to convert to an order
 *     responses:
 *       200:
 *         $ref: '#/components/responses/Success'
 *       400:
 *         $ref: '#/components/responses/Error'
 */
router.post("/create-order", validateRequest(createOrderSchema), (req, res) => {
  createOrderFromCartController(req, (result) => {
    res.json(result);
  });
});

module.exports = router;
