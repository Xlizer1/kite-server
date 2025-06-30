// src/api/v1/categories/model.js

const fs = require("fs");
const { executeQuery, executeTransaction, buildInsertQuery, buildUpdateQuery } = require("../../../helpers/db");
const { CustomError } = require("../../../middleware/errorHandler");

/**
 * Get all categories with pagination and filtering
 */
const getCategoriesModel = async (request, user) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            restaurant_id = "",
            sort_by = "created_at",
            sort_order = "DESC",
            include_item_count = false,
        } = request.query || {};

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        const conditions = ["c.deleted_at IS NULL"];
        const params = [];

        // Search functionality
        if (search && search.trim()) {
            conditions.push("c.name LIKE ?");
            params.push(`%${search.trim()}%`);
        }

        // Restaurant filter
        let finalRestaurantId = restaurant_id;
        if (!finalRestaurantId && user.restaurant_id) {
            finalRestaurantId = user.restaurant_id;
        }

        if (finalRestaurantId) {
            conditions.push("c.restaurant_id = ?");
            params.push(parseInt(finalRestaurantId));
        } else if (user.department_id === 2) {
            // RESTAURANT_ADMIN
            // If no restaurant_id specified and user is restaurant admin, return empty
            return {
                data: [],
                pagination: {
                    current_page: parseInt(page),
                    total_pages: 0,
                    total_records: 0,
                    limit: limitNum,
                    has_next: false,
                    has_prev: false,
                },
                filters: { search, restaurant_id: finalRestaurantId, sort_by, sort_order },
            };
        }

        // Restrict to user's restaurant for restaurant admins
        if (user.department_id === 2 && user.restaurant_id) {
            const hasRestaurantCondition = conditions.some((condition) => condition.includes("restaurant_id"));
            if (!hasRestaurantCondition) {
                conditions.push("c.restaurant_id = ?");
                params.push(user.restaurant_id);
            }
        }

        // Validate sort fields to prevent SQL injection
        const allowedSortFields = ["id", "name", "created_at", "updated_at", "item_count"];
        const sortField = allowedSortFields.includes(sort_by) ? sort_by : "created_at";
        const sortDirection = sort_order.toUpperCase() === "DESC" ? "DESC" : "ASC";

        const whereClause = conditions.join(" AND ");

        // Build query based on whether item count is requested
        let dataQuery;
        if (include_item_count === "true") {
            dataQuery = `
                SELECT 
                    c.id,
                    c.name,
                    c.restaurant_id,
                    c.created_at,
                    c.updated_at,
                    r.name AS restaurant_name,
                    i.url AS image_url,
                    COUNT(items.id) as item_count
                FROM 
                    categories c
                LEFT JOIN restaurants r ON c.restaurant_id = r.id
                LEFT JOIN categories_image_map cim ON cim.category_id = c.id AND cim.is_primary = 1
                LEFT JOIN images i ON cim.image_id = i.id
                LEFT JOIN items ON c.id = items.category_id AND items.deleted_at IS NULL
                WHERE 
                    ${whereClause}
                GROUP BY c.id, c.name, c.restaurant_id, c.created_at, c.updated_at, r.name, i.url
                ORDER BY 
                    ${sortField === "item_count" ? "item_count" : `c.${sortField}`} ${sortDirection}
                LIMIT ? OFFSET ?
            `;
        } else {
            dataQuery = `
                SELECT 
                    c.id,
                    c.name,
                    c.restaurant_id,
                    c.created_at,
                    c.updated_at,
                    r.name AS restaurant_name,
                    i.url AS image_url
                FROM 
                    categories c
                LEFT JOIN restaurants r ON c.restaurant_id = r.id
                LEFT JOIN categories_image_map cim ON cim.category_id = c.id AND cim.is_primary = 1
                LEFT JOIN images i ON cim.image_id = i.id
                WHERE 
                    ${whereClause}
                ORDER BY 
                    c.${sortField} ${sortDirection}
                LIMIT ? OFFSET ?
            `;
        }

        // Count query for total records
        const countQuery = `
            SELECT COUNT(DISTINCT c.id) as total
            FROM categories c
            LEFT JOIN restaurants r ON c.restaurant_id = r.id
            WHERE ${whereClause}
        `;

        const dataParams = [...params, limitNum, offset];
        const countParams = [...params];

        const [result, countResult] = await Promise.all([
            executeQuery(dataQuery, dataParams, "getCategories"),
            executeQuery(countQuery, countParams, "getCategoriesCount"),
        ]);

        const total = countResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limitNum);

        return {
            data: result || [],
            pagination: {
                current_page: parseInt(page),
                total_pages: totalPages,
                total_records: total,
                limit: limitNum,
                has_next: parseInt(page) < totalPages,
                has_prev: parseInt(page) > 1,
            },
            filters: {
                search,
                restaurant_id: finalRestaurantId,
                sort_by: sortField,
                sort_order: sortDirection,
                include_item_count,
            },
        };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Get category by ID
 */
const getCategoryByIdModel = async (id, user) => {
    try {
        let sql = `
            SELECT 
                c.id,
                c.name,
                c.restaurant_id,
                c.created_at,
                c.updated_at,
                JSON_OBJECT(
                    'id', r.id,
                    'name', r.name
                ) as restaurant,
                JSON_ARRAYAGG(
                    CASE 
                        WHEN i.id IS NOT NULL THEN
                            JSON_OBJECT(
                                'id', i.id,
                                'url', i.url,
                                'primary', cim.is_primary
                            )
                        ELSE NULL
                    END
                ) AS images,
                COUNT(items.id) as item_count
            FROM 
                categories c
            LEFT JOIN restaurants r ON c.restaurant_id = r.id
            LEFT JOIN categories_image_map cim ON c.id = cim.category_id
            LEFT JOIN images i ON cim.image_id = i.id AND i.id IS NOT NULL AND i.url IS NOT NULL
            LEFT JOIN items ON c.id = items.category_id AND items.deleted_at IS NULL
            WHERE 
                c.id = ? AND c.deleted_at IS NULL
        `;

        // Restrict to user's restaurant for restaurant admins
        if (user?.department_id === 2 && user?.restaurant_id) {
            sql += ` AND c.restaurant_id = ${user.restaurant_id}`;
        }

        sql += ` GROUP BY c.id, c.name, c.restaurant_id, c.created_at, c.updated_at, r.id, r.name`;

        const result = await executeQuery(sql, [id], "getCategoryById");
        const category = result?.[0] || null;

        if (category) {
            // Filter out null images
            category.images = category.images?.filter((img) => img !== null) || [];
        }

        return category;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Create new restaurant category
 */
const createRestaurantCategoryModel = async (name, restaurant_id, image, creator_id) => {
    try {
        // Check if category name already exists for this restaurant
        const existingCategory = await executeQuery(
            "SELECT id FROM categories WHERE name = ? AND restaurant_id = ? AND deleted_at IS NULL",
            [name, restaurant_id],
            "checkExistingCategory"
        );

        if (existingCategory.length > 0) {
            return {
                status: false,
                message: "A category with this name already exists for this restaurant",
            };
        }

        // Prepare queries array for transaction
        const queries = [];

        // Add category insert query
        const categoryQuery = buildInsertQuery("categories", {
            name,
            restaurant_id,
            created_at: new Date(),
            created_by: creator_id,
        });
        queries.push(categoryQuery);

        // Handle image if provided
        if (image) {
            // Validate file type
            const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
            if (!allowedTypes.includes(image.mimetype)) {
                throw new CustomError(`Invalid file type for image: ${image.originalname}`, 400);
            }

            // Create categories directory if it doesn't exist
            const dir = `${__dirname}/../../../uploads/categories`;
            if (!fs.existsSync(dir)) {
                await fs.promises.mkdir(dir, { recursive: true });
            }

            // Generate safe filename
            const ext = image.originalname.split(".").pop().toLowerCase();
            const imageName = `category_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
            const targetPath = `${dir}/${imageName}`;

            // Move file with proper error handling
            await fs.promises.rename(image.path, targetPath);

            // Add image insert query
            const imageQuery = buildInsertQuery("images", {
                url: `/uploads/categories/${imageName}`,
                created_at: new Date(),
                created_by: creator_id,
            });
            queries.push(imageQuery);

            // Add image mapping query - using proper variable references
            queries.push({
                sql: "INSERT INTO categories_image_map (image_id, category_id, is_primary, created_at, created_by) SELECT LAST_INSERT_ID(), (SELECT LAST_INSERT_ID() FROM categories), 1, NOW(), ?",
                params: [creator_id],
            });
        }

        // Execute all queries in transaction
        const results = await executeTransaction(queries, "createRestaurantCategory");
        const categoryId = results[0].insertId;

        // Fetch the created category
        const createdCategory = await getCategoryByIdModel(categoryId, { department_id: 1 });

        return {
            status: true,
            category: createdCategory,
        };
    } catch (error) {
        // Clean up uploaded file if exists
        if (image?.path) {
            await fs.promises.unlink(image.path).catch(console.error);
        }
        throw error;
    }
};

/**
 * Update category (Fixed the SQL syntax error)
 */
const updateCategoryModel = async (id, name, user_id) => {
    try {
        // Check if category name already exists for this restaurant (excluding current)
        const existingCategory = await executeQuery(
            `SELECT c.id, c.restaurant_id 
             FROM categories c 
             WHERE c.id = ? AND c.deleted_at IS NULL`,
            [id],
            "getCurrentCategory"
        );

        if (!existingCategory.length) {
            throw new CustomError("Category not found", 404);
        }

        const currentCategory = existingCategory[0];

        // Check for name conflicts in the same restaurant
        const nameConflict = await executeQuery(
            "SELECT id FROM categories WHERE name = ? AND restaurant_id = ? AND id != ? AND deleted_at IS NULL",
            [name, currentCategory.restaurant_id, id],
            "checkCategoryNameConflict"
        );

        if (nameConflict.length > 0) {
            return {
                status: false,
                message: "A category with this name already exists for this restaurant",
            };
        }

        // Fixed SQL query - added missing comma
        const sql = `
            UPDATE categories
            SET 
                name = ?,
                updated_by = ?,
                updated_at = NOW()
            WHERE id = ? AND deleted_at IS NULL
        `;

        const result = await executeQuery(sql, [name, user_id, id], "updateCategory");

        if (result.affectedRows > 0) {
            const updatedCategory = await getCategoryByIdModel(id, { department_id: 1 });
            return {
                status: true,
                category: updatedCategory,
            };
        } else {
            return {
                status: false,
                message: "Failed to update category",
            };
        }
    } catch (error) {
        throw new CustomError(error.message, error.statusCode || 500);
    }
};

/**
 * Delete category (soft delete)
 */
const deleteCategoryModel = async (id, user_id) => {
    try {
        // Check if category has items
        const itemCount = await executeQuery(
            "SELECT COUNT(*) as count FROM items WHERE category_id = ? AND deleted_at IS NULL",
            [id],
            "checkCategoryItems"
        );

        if (itemCount[0]?.count > 0) {
            return {
                status: false,
                message: `Cannot delete category. It has ${itemCount[0].count} items. Please move or delete items first.`,
            };
        }

        const updateData = {
            deleted_at: new Date(),
            deleted_by: user_id,
            updated_at: new Date(),
            updated_by: user_id,
        };

        const { sql, params } = buildUpdateQuery("categories", updateData, { id });
        const result = await executeQuery(sql, params, "deleteCategory");

        return { status: result.affectedRows > 0 };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Update category image
 */
const updateCategoryImageModel = async (category_id, image, user_id) => {
    try {
        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
        if (!allowedTypes.includes(image.mimetype)) {
            throw new CustomError(`Invalid file type for image: ${image.originalname}`, 400);
        }

        // Generate safe filename
        const ext = image.originalname.split(".").pop().toLowerCase();
        const imageName = `category_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        const targetPath = `${__dirname}/../../../uploads/categories/${imageName}`;

        // Create categories directory if it doesn't exist
        const dir = `${__dirname}/../../../uploads/categories`;
        if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir, { recursive: true });
        }

        // Copy file with proper error handling
        await fs.promises.copyFile(image.path, targetPath);
        // Clean up temp file after successful copy
        if (fs.existsSync(image.path)) {
            await fs.promises.unlink(image.path).catch(console.error);
        }

        // Insert new image
        const imageQuery = `
            INSERT INTO images (url, created_by)
            VALUES (?, ?)
        `;
        const imageResult = await executeQuery(
            imageQuery,
            [`/uploads/categories/${imageName}`, user_id],
            "insertCategoryImage"
        );
        const image_id = imageResult.insertId;

        // Update existing primary images to non-primary
        await executeQuery(
            "UPDATE categories_image_map SET is_primary = 0 WHERE category_id = ? AND is_primary = 1",
            [category_id],
            "updateOldPrimaryCategoryImage"
        );

        // Insert new image mapping
        await executeQuery(
            "INSERT INTO categories_image_map (image_id, category_id, is_primary, created_at, created_by) VALUES (?, ?, 1, NOW(), ?)",
            [image_id, category_id, user_id],
            "insertCategoryImageMap"
        );

        // Fetch and return updated category info
        const selectSql = `
            SELECT
                c.*,
                JSON_ARRAYAGG(
                    CASE 
                        WHEN i.id IS NOT NULL THEN
                            JSON_OBJECT(
                                'id', i.id,
                                'url', i.url,
                                'primary', cim.is_primary
                            )
                        ELSE NULL
                    END
                ) AS images
            FROM
                categories c
            LEFT JOIN
                categories_image_map cim ON c.id = cim.category_id
            LEFT JOIN
                images i ON cim.image_id = i.id AND i.id IS NOT NULL AND i.url IS NOT NULL
            WHERE
                c.id = ?
            GROUP BY
                c.id
        `;

        const result = await executeQuery(selectSql, [category_id], "getUpdatedCategoryInfo");

        if (!result || result.length === 0) {
            throw new CustomError("Category not found", 404);
        }

        const category = result[0];
        category.images = category.images?.filter((img) => img !== null) || [];

        return category;
    } catch (error) {
        // Clean up uploaded file in case of error
        if (image?.path && fs.existsSync(image.path)) {
            await fs.promises.unlink(image.path).catch(console.error);
        }
        if (error instanceof CustomError) {
            throw error;
        }
        throw new CustomError("Failed to update category image", 500);
    }
};

/**
 * Bulk delete categories
 */
const bulkDeleteCategoriesModel = async (categoryIds, deletedBy) => {
    try {
        // Check if any categories have items
        const placeholders = categoryIds.map(() => "?").join(",");
        const itemCheckSql = `
            SELECT category_id, COUNT(*) as item_count
            FROM items 
            WHERE category_id IN (${placeholders}) AND deleted_at IS NULL
            GROUP BY category_id
        `;
        const itemCounts = await executeQuery(itemCheckSql, categoryIds, "checkCategoriesItems");

        if (itemCounts.length > 0) {
            const categoriesWithItems = itemCounts.map(
                (row) => `Category ${row.category_id} (${row.item_count} items)`
            );
            throw new CustomError(
                `Cannot delete categories with items: ${categoriesWithItems.join(
                    ", "
                )}. Please move or delete items first.`,
                400
            );
        }

        const sql = `
            UPDATE categories 
            SET deleted_at = NOW(), deleted_by = ?, updated_at = NOW(), updated_by = ?
            WHERE id IN (${placeholders}) AND deleted_at IS NULL
        `;
        const params = [deletedBy, deletedBy, ...categoryIds];
        const result = await executeQuery(sql, params, "bulkDeleteCategories");

        return {
            status: true,
            deletedCount: result.affectedRows,
        };
    } catch (error) {
        throw new CustomError(error.message, error.statusCode || 500);
    }
};

/**
 * Export categories
 */
const exportCategoriesModel = async (format = "csv", user) => {
    try {
        let sql = `
            SELECT 
                c.id,
                c.name,
                r.name as restaurant_name,
                c.created_at,
                c.updated_at,
                COUNT(items.id) as item_count
            FROM categories c
            LEFT JOIN restaurants r ON c.restaurant_id = r.id
            LEFT JOIN items ON c.id = items.category_id AND items.deleted_at IS NULL
            WHERE c.deleted_at IS NULL
        `;

        const params = [];

        // Restrict to user's restaurant for restaurant admins
        if (user.department_id === 2 && user.restaurant_id) {
            sql += " AND c.restaurant_id = ?";
            params.push(user.restaurant_id);
        }

        sql += " GROUP BY c.id, c.name, r.name, c.created_at, c.updated_at ORDER BY c.created_at DESC";

        const categories = await executeQuery(sql, params, "exportCategories");

        return {
            status: true,
            data: {
                categories: categories,
                format: format,
                exported_at: new Date(),
            },
        };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Get category statistics
 */
const getCategoryStatisticsModel = async (restaurantId) => {
    try {
        let sql = `
            SELECT 
                COUNT(DISTINCT c.id) as total_categories,
                COUNT(DISTINCT CASE WHEN items.id IS NOT NULL THEN c.id END) as categories_with_items,
                COUNT(DISTINCT CASE WHEN items.id IS NULL THEN c.id END) as empty_categories,
                AVG(item_counts.item_count) as avg_items_per_category,
                MAX(item_counts.item_count) as max_items_per_category
            FROM categories c
            LEFT JOIN items ON c.id = items.category_id AND items.deleted_at IS NULL
            LEFT JOIN (
                SELECT category_id, COUNT(*) as item_count
                FROM items 
                WHERE deleted_at IS NULL
                GROUP BY category_id
            ) item_counts ON c.id = item_counts.category_id
            WHERE c.deleted_at IS NULL
        `;

        const params = [];
        if (restaurantId) {
            sql += " AND c.restaurant_id = ?";
            params.push(restaurantId);
        }

        const result = await executeQuery(sql, params, "getCategoryStatistics");
        return result[0] || null;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Activity logging helper
 */
const createUserActivityLogModel = async (activityData) => {
    try {
        const logData = {
            user_id: activityData.user_id,
            action: activityData.action,
            description: activityData.description,
            metadata: activityData.metadata || null,
            created_at: new Date(),
        };

        const { sql, params } = buildInsertQuery("user_activity_logs", logData);
        const result = await executeQuery(sql, params, "createUserActivityLog");
        return result.insertId;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Legacy function for backward compatibility with menu system
 * This is used by the menu/model.js file
 */
const getRestaurantCategoryModel = async (restaurant_id) => {
    try {
        const sql = `
            SELECT
                sc.id,
                sc.name,
                isc.url AS image_url
            FROM
                categories AS sc
            LEFT JOIN
                categories_image_map AS scim ON scim.category_id = sc.id
            LEFT JOIN
                images AS isc ON scim.image_id = isc.id AND scim.is_primary = 1
            WHERE
                sc.restaurant_id = ?
            AND
                sc.deleted_at IS NULL
            GROUP BY
                sc.id, sc.name, isc.url
            ORDER BY
                sc.name ASC
        `;

        const result = await executeQuery(sql, [restaurant_id], "getRestaurantCategory");
        return result;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

module.exports = {
    // New comprehensive functions
    getCategoriesModel,
    getCategoryByIdModel,
    createRestaurantCategoryModel,
    updateCategoryModel,
    deleteCategoryModel,
    updateCategoryImageModel,
    bulkDeleteCategoriesModel,
    exportCategoriesModel,
    getCategoryStatisticsModel,
    createUserActivityLogModel,

    // Legacy function for backward compatibility
    getRestaurantCategoryModel,
};
