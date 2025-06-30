const express = require("express");
const {
    getCategoriesController,
    getCategoryByIdController,
    createRestaurantCategoryController,
    updateCategoryController,
    deleteCategoryController,
    updateCategoryImageController,
    getCategoriesForSelectionController,
    getCategoryStatisticsController,
    bulkDeleteCategoriesController,
    exportCategoriesController,
} = require("./controller");

const multer = require("../../../middleware/multer");
const { checkUserAuthorized } = require("../../../helpers/common");
const { requirePermission, requireAdmin, requireManagement } = require("../../../helpers/permissions");
const validateRequest = require("../../../middleware/validateRequest");

const {
    categoryCreateSchema,
    categoryUpdateSchema,
    categoryIdParamSchema,
    categoryImageUpdateSchema,
    getCategoriesQuerySchema,
    bulkDeleteCategoriesSchema,
    exportCategoriesSchema,
} = require("../../../validators/categorySchema");

const router = express.Router();

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: Get all categories
 *     description: Returns a paginated list of categories with optional filtering. Requires 'categories' read permission.
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of categories per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for category name
 *       - in: query
 *         name: restaurant_id
 *         schema:
 *           type: integer
 *         description: Filter by restaurant ID (optional - uses user's restaurant if not provided)
 *       - in: query
 *         name: sort_by
 *         schema:
 *           type: string
 *           enum: [id, name, created_at, updated_at, item_count]
 *           default: created_at
 *         description: Field to sort by
 *       - in: query
 *         name: sort_order
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: Sort order
 *       - in: query
 *         name: include_item_count
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include item count for each category
 *     responses:
 *       200:
 *         description: List of categories with pagination metadata
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
 *                   type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           restaurant_id:
 *                             type: integer
 *                           restaurant_name:
 *                             type: string
 *                           image_url:
 *                             type: string
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                           item_count:
 *                             type: integer
 *                             description: Only included if include_item_count=true
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current_page:
 *                           type: integer
 *                         total_pages:
 *                           type: integer
 *                         total_records:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         has_next:
 *                           type: boolean
 *                         has_prev:
 *                           type: boolean
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get(
    "/",
    checkUserAuthorized(),
    requirePermission("categories", "read"),
    validateRequest(getCategoriesQuerySchema),
    (req, res) => {
        getCategoriesController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/categories/selection:
 *   get:
 *     summary: Get categories for selection
 *     description: Returns a simplified list of categories for dropdowns and selection inputs
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurant_id
 *         schema:
 *           type: integer
 *         description: Restaurant ID (optional - uses user's restaurant if not provided)
 *     responses:
 *       200:
 *         description: List of category options
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       value:
 *                         type: integer
 *                       label:
 *                         type: string
 *                       image_url:
 *                         type: string
 *       401:
 *         description: Unauthorized
 */
router.get("/selection", checkUserAuthorized(), requirePermission("categories", "read"), (req, res) => {
    getCategoriesForSelectionController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/categories/statistics:
 *   get:
 *     summary: Get category statistics
 *     description: Returns statistics about categories including total count and item distribution
 *     tags: [Categories Analytics]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: restaurant_id
 *         schema:
 *           type: integer
 *         description: Restaurant ID (optional for restaurant admins)
 *     responses:
 *       200:
 *         description: Category statistics
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
 *                   type: object
 *                   properties:
 *                     total_categories:
 *                       type: integer
 *                     categories_with_items:
 *                       type: integer
 *                     empty_categories:
 *                       type: integer
 *                     avg_items_per_category:
 *                       type: number
 *                     max_items_per_category:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/statistics", checkUserAuthorized(), requirePermission("categories", "read"), (req, res) => {
    getCategoryStatisticsController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/categories/export:
 *   get:
 *     summary: Export categories
 *     description: Exports category data in specified format. Management level access required.
 *     tags: [Categories Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json, xlsx]
 *           default: csv
 *         description: Export format
 *     responses:
 *       200:
 *         description: Categories exported successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Management access required
 */
router.get("/export", checkUserAuthorized(), requireManagement, validateRequest(exportCategoriesSchema), (req, res) => {
    exportCategoriesController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   get:
 *     summary: Get category by ID
 *     description: Returns a specific category by its ID with detailed information
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category details
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     restaurant_id:
 *                       type: integer
 *                     restaurant:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                     images:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           url:
 *                             type: string
 *                           primary:
 *                             type: boolean
 *                     item_count:
 *                       type: integer
 *                     created_at:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Invalid category ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Category not found
 */
router.get(
    "/:id",
    checkUserAuthorized(),
    requirePermission("categories", "read"),
    validateRequest(categoryIdParamSchema),
    (req, res) => {
        getCategoryByIdController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/categories:
 *   post:
 *     summary: Create new category
 *     description: Creates a new category. Requires 'categories' create permission.
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Main Courses"
 *                 description: Name of the category
 *               restaurant_id:
 *                 type: integer
 *                 description: Restaurant ID (optional for restaurant admins - uses their restaurant)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Category image file (optional)
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
 *                   type: object
 *                   description: Created category object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: Category name already exists for this restaurant
 */
router.post(
    "/",
    checkUserAuthorized(),
    requirePermission("categories", "create"),
    multer.upload.single("image"),
    validateRequest(categoryCreateSchema),
    (req, res) => {
        createRestaurantCategoryController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/categories/bulk-delete:
 *   post:
 *     summary: Bulk delete categories
 *     description: Soft deletes multiple categories at once. Admin only.
 *     tags: [Categories Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_ids
 *             properties:
 *               category_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [2, 3, 4]
 *                 description: Array of category IDs to delete
 *     responses:
 *       200:
 *         description: Categories deleted successfully
 *       400:
 *         description: Validation error or categories have items
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post(
    "/bulk-delete",
    checkUserAuthorized(),
    requireAdmin,
    validateRequest(bulkDeleteCategoriesSchema),
    (req, res) => {
        bulkDeleteCategoriesController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   put:
 *     summary: Update category
 *     description: Updates an existing category. Requires 'categories' update permission.
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
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
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *                 example: "Updated Category Name"
 *                 description: Updated name of the category
 *     responses:
 *       200:
 *         description: Category updated successfully
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
 *                   type: object
 *                   description: Updated category object
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Category not found
 *       409:
 *         description: Category name already exists for this restaurant
 */
router.put(
    "/:id",
    checkUserAuthorized(),
    requirePermission("categories", "update"),
    validateRequest(categoryUpdateSchema),
    (req, res) => {
        updateCategoryController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/categories/{id}:
 *   delete:
 *     summary: Delete category
 *     description: Soft deletes a category. Requires 'categories' delete permission.
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Category ID
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Category has items and cannot be deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Category not found
 */
router.delete(
    "/:id",
    checkUserAuthorized(),
    requirePermission("categories", "delete"),
    validateRequest(categoryIdParamSchema),
    (req, res) => {
        deleteCategoryController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/categories/{id}/image:
 *   put:
 *     summary: Update category image
 *     description: Updates the primary image for a category. Requires 'categories' update permission.
 *     tags: [Categories]
 *     security:
 *       - BearerAuth: []
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
 *                   type: object
 *                   description: Updated category object with new image
 *       400:
 *         description: Validation error or invalid file type
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: Category not found
 */
router.put(
    "/:id/image",
    checkUserAuthorized(),
    requirePermission("categories", "update"),
    multer.upload.single("image"),
    validateRequest(categoryImageUpdateSchema),
    (req, res) => {
        updateCategoryImageController(req, (result) => {
            res.json(result);
        });
    }
);

module.exports = router;
