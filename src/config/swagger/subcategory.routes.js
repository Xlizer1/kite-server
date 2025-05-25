/**
 * Swagger documentation for sub-category routes
 */

/**
 * @swagger
 * tags:
 *   name: SubCategories
 *   description: Restaurant sub-category management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SubCategory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The sub-category ID
 *         name:
 *           type: string
 *           description: Name of the sub-category
 *         restaurant_id:
 *           type: integer
 *           description: ID of the restaurant this sub-category belongs to
 *         category_id:
 *           type: integer
 *           description: ID of the parent category
 *         image_url:
 *           type: string
 *           description: URL of the sub-category image
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the sub-category was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the sub-category was last updated
 */

/**
 * @swagger
 * /api/v1/sub_categories:
 *   get:
 *     summary: Get all sub-categories
 *     description: Retrieves a list of all restaurant sub-categories
 *     tags: [SubCategories]
 *     parameters:
 *       - in: query
 *         name: restaurant_id
 *         schema:
 *           type: integer
 *         description: Filter sub-categories by restaurant ID
 *     responses:
 *       200:
 *         description: List of sub-categories
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
 *                     $ref: '#/components/schemas/SubCategory'
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
 * /api/v1/sub_categories/get_by_category_id:
 *   get:
 *     summary: Get sub-categories by category ID
 *     description: Retrieves sub-categories filtered by parent category ID
 *     tags: [SubCategories]
 *     parameters:
 *       - in: query
 *         name: category_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Parent category ID
 *     responses:
 *       200:
 *         description: List of sub-categories for the specified category
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
 *                     $ref: '#/components/schemas/SubCategory'
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

/**
 * @swagger
 * /api/v1/sub_categories:
 *   post:
 *     summary: Create new sub-category
 *     description: Creates a new restaurant sub-category
 *     tags: [SubCategories]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - restaurant_id
 *               - image
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the sub-category
 *               restaurant_id:
 *                 type: integer
 *                 description: ID of the restaurant this sub-category belongs to
 *               category_id:
 *                 type: integer
 *                 description: ID of the parent category
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Sub-category image file
 *     responses:
 *       200:
 *         description: Sub-category created successfully
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
 *                   $ref: '#/components/schemas/SubCategory'
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
 * /api/v1/sub_categories/{id}/image:
 *   put:
 *     summary: Update sub-category image
 *     description: Updates the image of an existing sub-category
 *     tags: [SubCategories]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Sub-category ID
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
 *                 description: New sub-category image file
 *     responses:
 *       200:
 *         description: Sub-category image updated successfully
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
 *                   $ref: '#/components/schemas/SubCategory'
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
 *         description: Sub-category not found
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
