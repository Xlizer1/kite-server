const fs = require("fs");
const { executeQuery, executeTransaction, buildInsertQuery } = require("../../helpers/db");
const { CustomError } = require("../../middleware/errorHandler");

const getItems = async (restaurant_id) => {
    try {
        const sql = `
            SELECT
                i.id,
                i.name,
                i.description,
                i.price,
                i.is_shisha,
                c.code AS currency_code,
                im.url AS image_url,
                sc.name AS sub_category_name,
                cat.name AS category_name
            FROM
                items i
            LEFT JOIN
                items_image_map iim ON iim.item_id = i.id
            LEFT JOIN
                images im ON iim.image_id = im.id AND iim.is_primary = 1
            LEFT JOIN
                sub_categories sc ON i.sub_category_id = sc.id
            LEFT JOIN
                categories cat ON sc.category_id = cat.id
            LEFT JOIN
                currencies c ON i.currency_id = c.id
            WHERE
                i.restaurant_id = ?
            AND
                i.deleted_at IS NULL
            GROUP BY
                i.id, i.name, i.description, i.price, i.is_shisha, c.code, im.url, sc.name, cat.name
        `;

        const result = await executeQuery(sql, [restaurant_id], "getItems");
        if (!result.length) {
            throw new CustomError("No items found for the given restaurant", 404);
        }
        return result;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        throw new CustomError(error.message, 500);
    }
};

const getItemsBySubCategoryID = async (restaurant_id, sub_category_id) => {
    try {
        const sql = `
            SELECT
                i.id,
                i.name,
                i.description,
                i.price,
                i.is_shisha,
                c.code AS currency_code,
                im.url AS image_url,
                sc.name AS sub_category_name,
                cat.name AS category_name
            FROM
                items i
            LEFT JOIN
                items_image_map iim ON iim.item_id = i.id
            LEFT JOIN
                images im ON iim.image_id = im.id AND iim.is_primary = 1
            LEFT JOIN
                sub_categories sc ON i.sub_category_id = sc.id
            LEFT JOIN
                categories cat ON sc.category_id = cat.id
            LEFT JOIN
                currencies c ON i.currency_id = c.id
            WHERE
                i.restaurant_id = ?
            AND
                i.sub_category_id = ?
            AND
                i.deleted_at IS NULL
            GROUP BY
                i.id, i.name, i.description, i.price, i.is_shisha, c.code, im.url, sc.name, cat.name
        `;

        const result = await executeQuery(sql, [restaurant_id, sub_category_id], "getItemsBySubCategoryID");
        if (!result.length) {
            throw new CustomError("No items found for the given sub-category", 404);
        }
        return result;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        throw new CustomError(error.message, 500);
    }
};

const createItem = async (data) => {
    try {
        const { 
            name, 
            description, 
            price,
            currency_id,
            restaurant_id,
            sub_category_id,
            is_shisha,
            images,
            creator_id 
        } = data;

        // Prepare queries array for transaction
        const queries = [];

        // Add item insert query
        const itemQuery = buildInsertQuery('items', {
            name,
            description,
            price,
            currency_id,
            restaurant_id,
            sub_category_id,
            is_shisha: is_shisha ? 1 : 0,
            created_at: new Date(),
            created_by: creator_id
        });
        queries.push(itemQuery);

        // Handle images if provided
        if (images?.length) {
            for (const image of images) {
                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
                if (!allowedTypes.includes(image.mimetype)) {
                    throw new CustomError(`Invalid file type for image: ${image.originalname}. Allowed types: ${allowedTypes.join(', ')}`, 400);
                }

                // Generate safe filename
                const ext = image.originalname.split('.').pop().toLowerCase();
                const imageName = `item_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
                const targetPath = `uploads/items/${imageName}`;

                // Move file with proper error handling
                await fs.promises.rename(image.path, targetPath);

                // Add image insert query
                const imageQuery = buildInsertQuery('images', {
                    url: `/uploads/items/${imageName}`,
                    created_at: new Date(),
                    created_by: creator_id
                });
                queries.push(imageQuery);

                // Add image mapping query
                queries.push({
                    sql: 'INSERT INTO items_image_map (image_id, item_id, is_primary, created_at, created_by) VALUES (LAST_INSERT_ID(), LAST_INSERT_ID(), ?, NOW(), ?)',
                    params: [images.indexOf(image) === 0, creator_id]
                });
            }
        }

        // Execute all queries in transaction
        await executeTransaction(queries, 'createItem');
        return true;

    } catch (error) {
        // Clean up uploaded files if exists
        if (images?.length) {
            for (const image of images) {
                if (image?.path) {
                    await fs.promises.unlink(image.path).catch(console.error);
                }
            }
        }
        if (error instanceof CustomError) throw error;
        throw new CustomError(error.message, 500);
    }
};

module.exports = {
    getItemsModel: getItems,
    getItemsBySubCategoryIDModel: getItemsBySubCategoryID,
    createItemModel: createItem,
};
