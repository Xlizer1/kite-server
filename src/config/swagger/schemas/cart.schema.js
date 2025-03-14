/**
 * @swagger
 * components:
 *   schemas:
 *     Cart:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the cart
 *         session_id:
 *           type: string
 *           description: Session identifier for the cart
 *         table_id:
 *           type: integer
 *           description: ID of the table associated with the cart
 *         restaurant_id:
 *           type: integer
 *           description: ID of the restaurant associated with the cart
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the cart was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the cart was last updated
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/CartItem'
 *     
 *     CartItem:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the cart item
 *         cart_id:
 *           type: string
 *           format: uuid
 *           description: ID of the cart this item belongs to
 *         menu_item_id:
 *           type: integer
 *           description: ID of the menu item
 *         quantity:
 *           type: integer
 *           description: Quantity of the item
 *         special_instructions:
 *           type: string
 *           description: Special instructions for the item
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the cart item was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the cart item was last updated
 *     
 *     CaptainCall:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique identifier for the captain call
 *         cart_id:
 *           type: string
 *           format: uuid
 *           description: ID of the cart associated with the call
 *         table_id:
 *           type: integer
 *           description: ID of the table making the call
 *         restaurant_id:
 *           type: integer
 *           description: ID of the restaurant
 *         status:
 *           type: string
 *           enum: [pending, completed]
 *           description: Status of the captain call
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the call was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the call was last updated
 */
