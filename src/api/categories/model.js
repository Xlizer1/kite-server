const fs = require("fs");
const { executeQuery, executeTransaction, buildInsertQuery } = require("../../helpers/db");
const { CustomError } = require("../../middleware/errorHandler");

const getRestaurantCategory = async (restaurant_id) => {
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
            GROUP BY
                sc.id, sc.name, isc.url
        `;

        const result = await executeQuery(sql, [restaurant_id], "getRestaurantCategory");
        return result;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const createRestaurantCategory = async (name, restaurant_id, image, creator_id) => {
    try {
        // Prepare queries array for transaction
        const queries = [];

        // Add category insert query
        const categoryQuery = buildInsertQuery('categories', {
            name,
            restaurant_id,
            created_at: new Date(),
            created_by: creator_id
        });
        queries.push(categoryQuery);

        // Handle image if provided
        if (image) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
            if (!allowedTypes.includes(image.mimetype)) {
                throw new CustomError(`Invalid file type for image: ${image.originalname}`, 400);
            }

            // Generate safe filename
            const ext = image.originalname.split('.').pop().toLowerCase();
            const imageName = `category_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
            const targetPath = `uploads/categories/${imageName}`;

            // Move file with proper error handling
            await fs.promises.rename(image.path, targetPath);

            // Add image insert query
            const imageQuery = buildInsertQuery('images', {
                url: `/uploads/categories/${imageName}`,
                created_at: new Date(),
                created_by: creator_id
            });
            queries.push(imageQuery);

            // Add image mapping query
            queries.push({
                sql: 'INSERT INTO categories_image_map (image_id, category_id, is_primary, created_at, created_by) VALUES (LAST_INSERT_ID(), LAST_INSERT_ID(), true, NOW(), ?)',
                params: [creator_id]
            });
        }

        // Execute all queries in transaction
        await executeTransaction(queries, 'createRestaurantCategory');
        return true;

    } catch (error) {
        // Clean up uploaded file if exists
        if (image?.path) {
            await fs.promises.unlink(image.path).catch(console.error);
        }
        throw error;
    }
};

module.exports = {
    getRestaurantCategoryModel: getRestaurantCategory,
    createRestaurantCategoryModel: createRestaurantCategory,
};
