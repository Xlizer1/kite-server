/**
 * Swagger documentation for category routes
 */

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Restaurant category management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Category:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The category ID
 *         parent_rest_id:
 *           type: integer
 *           description: ID of the restaurant this category belongs to
 *         name:
 *           type: string
 *           description: Name of the category
 *         tagline:
 *           type: string
 *           description: Short tagline for the category
 *         description:
 *           type: string
 *           description: Detailed description of the category
 *         image_url:
 *           type: string
 *           description: URL of the category image
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the category was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the category was last updated
 */

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get all categories
 *     description: Retrieves a list of all restaurant categories
 *     tags: [Categories]
 *     parameters:
 *       - in: query
 *         name: restaurant_id
 *         schema:
 *           type: integer
 *         description: Filter categories by restaurant ID
 *     responses:
 *       200:
 *         description: List of categories
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
 *                     $ref: '#/components/schemas/Category'
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
 */

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Create new category
 *     description: Creates a new restaurant category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - parent_rest_id
 *               - name
 *               - tagline
 *               - description
 *               - image
 *             properties:
 *               parent_rest_id:
 *                 type: integer
 *                 description: ID of the restaurant this category belongs to
 *               name:
 *                 type: string
 *                 description: Name of the category
 *               tagline:
 *                 type: string
 *                 description: Short tagline for the category
 *               description:
 *                 type: string
 *                 description: Detailed description of the category
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Category image file
 *     responses:
 *       200:
 *         description: Category created successfully
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
 *                   $ref: '#/components/schemas/Category'
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
 */

/**
 * @swagger
 * /api/v1/categories/{id}/image:
 *   put:
 *     summary: Update category image
 *     description: Updates the image of an existing category
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New category image file
 *     responses:
 *       200:
 *         description: Category image updated successfully
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
 *                   $ref: '#/components/schemas/Category'
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
 *       404:
 *         description: Category not found
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
