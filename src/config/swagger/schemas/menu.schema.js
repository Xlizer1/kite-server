/**
 * @swagger
 * components:
 *   schemas:
 *     MenuItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The menu item ID
 *         name:
 *           type: string
 *           description: Name of the menu item
 *         description:
 *           type: string
 *           description: Description of the menu item
 *         price:
 *           type: number
 *           description: Price of the menu item
 *         image_url:
 *           type: string
 *           description: URL of the item image
 *         category_id:
 *           type: integer
 *           description: ID of the category this item belongs to
 *         sub_category_id:
 *           type: integer
 *           description: ID of the sub-category this item belongs to
 *         is_available:
 *           type: boolean
 *           description: Whether the item is available for ordering
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
 *         description:
 *           type: string
 *           description: Description of the category
 *         image_url:
 *           type: string
 *           description: URL of the category image
 *         sub_categories:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/SubCategory'
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
 *         description:
 *           type: string
 *           description: Description of the sub-category
 *         image_url:
 *           type: string
 *           description: URL of the sub-category image
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/MenuItem'
 */
