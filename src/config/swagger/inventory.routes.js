/**
 * Swagger documentation for inventory routes
 */

/**
 * @swagger
 * tags:
 *   name: Inventory
 *   description: Inventory management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     InventoryItem:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The inventory item ID
 *         restaurant_id:
 *           type: integer
 *           description: ID of the restaurant this inventory item belongs to
 *         name:
 *           type: string
 *           description: Name of the inventory item
 *         quantity:
 *           type: number
 *           format: float
 *           description: Current quantity of the item in stock
 *         unit_id:
 *           type: integer
 *           description: ID of the unit of measurement
 *         threshold:
 *           type: number
 *           format: float
 *           description: Threshold quantity for low stock alerts
 *         price:
 *           type: number
 *           format: float
 *           description: Price per unit of the inventory item
 *         currency_id:
 *           type: integer
 *           description: ID of the currency
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the inventory item was created
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the inventory item was last updated
 *     
 *     InventoryHistory:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: The history entry ID
 *         inventory_item_id:
 *           type: integer
 *           description: ID of the inventory item
 *         previous_quantity:
 *           type: number
 *           format: float
 *           description: Previous quantity before the change
 *         new_quantity:
 *           type: number
 *           format: float
 *           description: New quantity after the change
 *         change_type:
 *           type: string
 *           enum: [addition, deduction, adjustment]
 *           description: Type of inventory change
 *         reason:
 *           type: string
 *           description: Reason for the inventory change
 *         user_id:
 *           type: integer
 *           description: ID of the user who made the change
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Date and time when the history entry was created
 */

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items
 *     description: Retrieves a list of all inventory items
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of inventory items
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
 *                     $ref: '#/components/schemas/InventoryItem'
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
 * /api/inventory/restaurant/{restaurant_id}:
 *   get:
 *     summary: Get inventory items by restaurant ID
 *     description: Retrieves inventory items filtered by restaurant ID
 *     tags: [Inventory]
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
 *         description: List of inventory items for the specified restaurant
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
 *                     $ref: '#/components/schemas/InventoryItem'
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
 * /api/inventory/low-stock/{restaurant_id}:
 *   get:
 *     summary: Get low stock items by restaurant ID
 *     description: Retrieves inventory items with quantity below threshold for a specific restaurant
 *     tags: [Inventory]
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
 *         description: List of low stock inventory items for the specified restaurant
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
 *                     $ref: '#/components/schemas/InventoryItem'
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
 * /api/inventory/history/{id}:
 *   get:
 *     summary: Get inventory history
 *     description: Retrieves history of changes for a specific inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
 *     responses:
 *       200:
 *         description: History of changes for the specified inventory item
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
 *                     $ref: '#/components/schemas/InventoryHistory'
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
 *         description: Inventory item not found
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
 * /api/inventory:
 *   post:
 *     summary: Create new inventory item
 *     description: Creates a new inventory item
 *     tags: [Inventory]
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
 *               - name
 *               - quantity
 *               - unit_id
 *               - price
 *               - currency_id
 *             properties:
 *               restaurant_id:
 *                 type: integer
 *                 description: ID of the restaurant this inventory item belongs to
 *               name:
 *                 type: string
 *                 description: Name of the inventory item
 *               quantity:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Initial quantity of the item in stock
 *               unit_id:
 *                 type: integer
 *                 description: ID of the unit of measurement
 *               threshold:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Threshold quantity for low stock alerts
 *               price:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Price per unit of the inventory item
 *               currency_id:
 *                 type: integer
 *                 description: ID of the currency
 *     responses:
 *       201:
 *         description: Inventory item created successfully
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
 *                   $ref: '#/components/schemas/InventoryItem'
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

/**
 * @swagger
 * /api/inventory/{id}:
 *   put:
 *     summary: Update inventory item
 *     description: Updates an existing inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - restaurant_id
 *               - name
 *               - quantity
 *               - unit_id
 *               - price
 *               - currency_id
 *             properties:
 *               restaurant_id:
 *                 type: integer
 *                 description: ID of the restaurant this inventory item belongs to
 *               name:
 *                 type: string
 *                 description: Name of the inventory item
 *               quantity:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Updated quantity of the item in stock
 *               unit_id:
 *                 type: integer
 *                 description: ID of the unit of measurement
 *               threshold:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Threshold quantity for low stock alerts
 *               price:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Price per unit of the inventory item
 *               currency_id:
 *                 type: integer
 *                 description: ID of the currency
 *     responses:
 *       200:
 *         description: Inventory item updated successfully
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
 *                   $ref: '#/components/schemas/InventoryItem'
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
 *       404:
 *         description: Inventory item not found
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
 * /api/inventory/{id}:
 *   delete:
 *     summary: Delete inventory item
 *     description: Deletes an existing inventory item
 *     tags: [Inventory]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Inventory item ID
 *     responses:
 *       200:
 *         description: Inventory item deleted successfully
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
 *         description: Inventory item not found
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
