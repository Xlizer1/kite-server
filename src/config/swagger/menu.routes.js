/**
 * Swagger documentation for menu routes
 */

/**
 * @swagger
 * tags:
 *   name: Menu
 *   description: Restaurant menu endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RestaurantInfo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The restaurant ID
 *         name:
 *           type: string
 *           description: Name of the restaurant
 *         description:
 *           type: string
 *           description: Description of the restaurant
 *         tagline:
 *           type: string
 *           description: Tagline of the restaurant
 *         image_url:
 *           type: string
 *           description: URL of the restaurant's primary image
 *
 *     RestaurantSettings:
 *       type: object
 *       properties:
 *         primary_color:
 *           type: string
 *           description: Primary color for restaurant theme
 *         secondary_color:
 *           type: string
 *           description: Secondary color for restaurant theme
 *
 *     SubCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The sub-category ID
 *         name:
 *           type: string
 *           description: Name of the sub-category
 *         image_url:
 *           type: string
 *           description: URL of the sub-category's image
 *
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The category ID
 *         name:
 *           type: string
 *           description: Name of the category
 *         image_url:
 *           type: string
 *           description: URL of the category's image
 *         sub_categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubCategory'
 *           description: List of sub-categories in this category
 *
 *     RestaurantMenu:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The restaurant ID
 *         name:
 *           type: string
 *           description: Name of the restaurant
 *         description:
 *           type: string
 *           description: Description of the restaurant
 *         tagline:
 *           type: string
 *           description: Tagline of the restaurant
 *         image_url:
 *           type: string
 *           description: URL of the restaurant's primary image
 *         primary_color:
 *           type: string
 *           description: Primary color for restaurant theme
 *         secondary_color:
 *           type: string
 *           description: Secondary color for restaurant theme
 *         categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Category'
 *           description: List of categories in the restaurant menu
 *         sessionId:
 *           type: string
 *           description: Session ID for the cart
 */

/**
 * @swagger
 * /api/menu/main:
 *   get:
 *     summary: Get restaurant main menu
 *     description: Retrieves the main menu for a restaurant based on the encrypted table key
 *     tags: [Menu]
 *     parameters:
 *       - in: query
 *         name: key
 *         required: true
 *         schema:
 *           type: string
 *         description: Encrypted table key containing restaurant_id and table number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - latitude
 *               - longitude
 *             properties:
 *               latitude:
 *                 type: number
 *                 format: float
 *                 description: Latitude of the user's location
 *               longitude:
 *                 type: number
 *                 format: float
 *                 description: Longitude of the user's location
 *     responses:
 *       200:
 *         description: Restaurant menu retrieved successfully
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
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/RestaurantMenu'
 *       400:
 *         description: Invalid request
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
 *                   example: Please provide a key!
 *       401:
 *         description: Invalid table key
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
 *                   example: Invalid Table Key!
 *       403:
 *         description: Location out of range
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
 *                   example: Menu only available within restaurant.
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
 *                   example: Restaurant not found.
 *       500:
 *         description: Server error
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
 *                   example: Something went wrong. Please try again later.
 */
