/**
 * Swagger documentation for ingredient routes
 */

/**
 * @swagger
 * tags:
 *   name: Ingredients
 *   description: Ingredient management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Ingredient:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The ingredient ID
 *         restaurant_id:
 *           type: integer
 *           description: ID of the restaurant this ingredient belongs to
 *         menu_item_id:
 *           type: integer
 *           description: ID of the menu item this ingredient is used in
 *         inv_item_id:
 *           type: integer
 *           description: ID of the inventory item
 *         unit_id:
 *           type: integer
 *           description: ID of the unit of measurement
 *         quantity:
 *           type: number
 *           format: float
 *           description: Quantity of the ingredient
 *         creator_id:
 *           type: integer
 *           description: ID of the user who created this ingredient
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the ingredient was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the ingredient was last updated
 */

/**
 * @swagger
 * /api/v1/ingredients:
 *   get:
 *     summary: Get all ingredients
 *     description: Retrieves a list of all ingredients
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of ingredients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ingredient'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Authentication required
 */

/**
 * @swagger
 * /api/v1/ingredients/{restaurant_id}:
 *   get:
 *     summary: Get ingredients by restaurant ID
 *     description: Retrieves ingredients filtered by restaurant ID
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: restaurant_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Restaurant ID
 *     responses:
 *       200:
 *         description: List of ingredients for the specified restaurant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ingredient'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Authentication required
 *       404:
 *         description: Restaurant not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /api/v1/ingredients:
 *   post:
 *     summary: Create new ingredient
 *     description: Creates a new ingredient
 *     tags: [Ingredients]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_id
 *               - menu_item_id
 *               - inv_item_id
 *               - unit_id
 *               - quantity
 *             properties:
 *               restaurant_id:
 *                 type: integer
 *                 description: ID of the restaurant this ingredient belongs to
 *               menu_item_id:
 *                 type: integer
 *                 description: ID of the menu item this ingredient is used in
 *               inv_item_id:
 *                 type: integer
 *                 description: ID of the inventory item
 *               unit_id:
 *                 type: integer
 *                 description: ID of the unit of measurement
 *               quantity:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Quantity of the ingredient
 *               creator_id:
 *                 type: integer
 *                 description: ID of the user creating this ingredient
 *     responses:
 *       201:
 *         description: Ingredient created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/Ingredient'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Authentication required
 */
