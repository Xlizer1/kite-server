const fs = require("fs");
const { executeQuery, executeTransaction, buildInsertQuery } = require("../../../helpers/db");
const { CustomError } = require("../../../middleware/errorHandler");

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
                cat.name AS category_name,
                cat.id AS category_id
            FROM
                items i
            LEFT JOIN
                items_image_map iim ON iim.item_id = i.id
            LEFT JOIN
                images im ON iim.image_id = im.id AND iim.is_primary = 1
            LEFT JOIN
                categories cat ON i.category_id = cat.id
            LEFT JOIN
                currencies c ON i.currency_id = c.id
            WHERE
                i.restaurant_id = ?
            AND
                i.deleted_at IS NULL
            GROUP BY
                i.id, i.name, i.description, i.price, i.is_shisha, c.code, im.url, cat.name, cat.id
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

const getItemByID = async (item_id) => {
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
                cat.name AS category_name,
                cat.id AS category_id
            FROM
                items i
            LEFT JOIN
                items_image_map iim ON iim.item_id = i.id
            LEFT JOIN
                images im ON iim.image_id = im.id AND iim.is_primary = 1
            LEFT JOIN
                categories cat ON i.category_id = cat.id
            LEFT JOIN
                currencies c ON i.currency_id = c.id
            WHERE
                i.id = ?
            AND
                i.deleted_at IS NULL
            GROUP BY
                i.id, i.name, i.description, i.price, i.is_shisha, c.code, im.url, cat.name, cat.id
        `;

        const result = await executeQuery(sql, [item_id], "getItemByID");
        if (!result.length) {
            throw new CustomError("No items found for the given restaurant", 200);
        }
        return result[0];
    } catch (error) {
        if (error instanceof CustomError) throw error;
        throw new CustomError(error.message, 500);
    }
};

const getItemsByCategoryID = async (restaurant_id, category_id) => {
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
                cat.name AS category_name,
                cat.id AS category_id
            FROM
                items i
            LEFT JOIN
                items_image_map iim ON iim.item_id = i.id
            LEFT JOIN
                images im ON iim.image_id = im.id AND iim.is_primary = 1
            LEFT JOIN
                categories cat ON i.category_id = cat.id
            LEFT JOIN
                currencies c ON i.currency_id = c.id
            WHERE
                i.restaurant_id = ?
            AND
                i.category_id = ?
            AND
                i.deleted_at IS NULL
            GROUP BY
                i.id, i.name, i.description, i.price, i.is_shisha, c.code, im.url, cat.name, cat.id
        `;

        const result = await executeQuery(sql, [restaurant_id, category_id], "getItemsByCategoryID");
        if (!result.length) {
            throw new CustomError("No items found for the given category", 404);
        }
        return result;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        throw new CustomError(error.message, 500);
    }
};

const getPaginatedItemsByCategoryIDModel = async (category_id, restaurant_id, limit, offset) => {
    try {
        const sql = `
            SELECT
                i.id,
                i.name,
                i.description,
                i.price,
                i.is_shisha,
                c.code AS currency_code,
                im.url AS image_url
            FROM items i
            LEFT JOIN items_image_map iim ON i.id = iim.item_id
            LEFT JOIN images im ON iim.image_id = im.id AND iim.is_primary = 1
            LEFT JOIN currencies c ON i.currency_id = c.id
            WHERE i.category_id = ?
            AND i.restaurant_id = ?
            AND i.deleted_at IS NULL
            ORDER BY i.id
            LIMIT ?, ?
        `;

        const result = await executeQuery(
            sql,
            [category_id, restaurant_id, offset, limit],
            "getPaginatedItemsByCategoryID"
        );

        return result;
    } catch (error) {
        if (error instanceof CustomError) throw error;
        throw new CustomError(error.message, 500);
    }
};

const createItem = async (data) => {
    const uploadedFile = data.images?.[0]; // Get the first image if exists
    try {
        const { name, description, price, currency_id, restaurant_id, category_id, is_shisha, creator_id } = data;

        // Create items directory if it doesn't exist
        const dir = `${__dirname}/../../../uploads/items`;
        if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir, { recursive: true });
        }

        // Insert item
        const itemQuery = `
            INSERT INTO items (
                name,
                description,
                price,
                currency_id,
                restaurant_id,
                category_id,
                is_shisha,
                created_at,
                created_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), ?)
        `;
        const itemResult = await executeQuery(
            itemQuery,
            [name, description, price, currency_id, restaurant_id, category_id, is_shisha ? 1 : 0, creator_id],
            "createItem"
        );
        const item_id = itemResult.insertId;

        // Handle image if provided
        if (uploadedFile) {
            // Validate file type
            const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
            if (!allowedTypes.includes(uploadedFile.mimetype)) {
                throw new CustomError(
                    `Invalid file type for image: ${uploadedFile.originalname}. Allowed types: ${allowedTypes.join(
                        ", "
                    )}`,
                    400
                );
            }

            // Generate safe filename
            const ext = uploadedFile.originalname.split(".").pop().toLowerCase();
            const imageName = `item_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
            const targetPath = `${__dirname}/../../../uploads/items/${imageName}`;

            // Copy file with proper error handling
            await fs.promises.copyFile(uploadedFile.path, targetPath);
            // Clean up temp file after successful copy
            if (fs.existsSync(uploadedFile.path)) {
                await fs.promises.unlink(uploadedFile.path).catch(console.error);
            }

            // Insert image
            const imageQuery = `
                INSERT INTO images (url, created_at, created_by)
                VALUES (?, NOW(), ?)
            `;
            const imageResult = await executeQuery(
                imageQuery,
                [`/uploads/items/${imageName}`, creator_id],
                "insertItemImage"
            );
            const image_id = imageResult.insertId;

            // Insert image mapping
            await executeQuery(
                "INSERT INTO items_image_map (image_id, item_id, is_primary, created_at, created_by) VALUES (?, ?, 1, NOW(), ?)",
                [image_id, item_id, creator_id],
                "insertItemImageMap"
            );
        }

        // Fetch and return the created item
        const selectSql = `
            SELECT
                i.*,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', img.id,
                        'url', img.url,
                        'primary', iim.is_primary
                    )
                ) AS images
            FROM
                items i
            LEFT JOIN
                items_image_map iim ON i.id = iim.item_id
            LEFT JOIN
                images img ON iim.image_id = img.id AND img.id IS NOT NULL AND img.url IS NOT NULL
            WHERE
                i.id = ?
            GROUP BY
                i.id
        `;

        const result = await executeQuery(selectSql, [item_id], "getCreatedItemInfo");
        return result[0];
    } catch (error) {
        // Clean up uploaded file if exists
        if (uploadedFile?.path && fs.existsSync(uploadedFile.path)) {
            await fs.promises.unlink(uploadedFile.path).catch(console.error);
        }
        if (error instanceof CustomError) throw error;
        throw new CustomError(error.message, 500);
    }
};

const updateItemImage = async (item_id, image, user_id) => {
    try {
        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
        if (!allowedTypes.includes(image.mimetype)) {
            throw new CustomError(`Invalid file type for image: ${image.originalname}`, 400);
        }

        // Generate safe filename
        const ext = image.originalname.split(".").pop().toLowerCase();
        const imageName = `item_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        const targetPath = `${__dirname}/../../../uploads/items/${imageName}`;

        // Create items directory if it doesn't exist
        const dir = `${__dirname}/../../../uploads/items`;
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
        const imageResult = await executeQuery(imageQuery, [`/uploads/items/${imageName}`, user_id], "insertItemImage");
        const image_id = imageResult.insertId;

        // Update existing primary images to non-primary
        await executeQuery(
            "UPDATE items_image_map SET is_primary = 0 WHERE item_id = ? AND is_primary = 1",
            [item_id],
            "updateOldPrimaryItemImage"
        );

        // Insert new image mapping
        await executeQuery(
            "INSERT INTO items_image_map (image_id, item_id, is_primary, created_at, created_by) VALUES (?, ?, 1, NOW(), ?)",
            [image_id, item_id, user_id],
            "insertItemImageMap"
        );

        // Fetch and return updated item info
        const selectSql = `
            SELECT
                i.*,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', img.id,
                        'url', img.url,
                        'primary', iim.is_primary
                    )
                ) AS images
            FROM
                items i
            LEFT JOIN
                items_image_map iim ON i.id = iim.item_id
            LEFT JOIN
                images img ON iim.image_id = img.id AND img.id IS NOT NULL AND img.url IS NOT NULL
            WHERE
                i.id = ?
            GROUP BY
                i.id
        `;

        const result = await executeQuery(selectSql, [item_id], "getUpdatedItemInfo");

        if (!result || result.length === 0) {
            throw new CustomError("Item not found", 404);
        }

        return result[0];
    } catch (error) {
        // Clean up uploaded file in case of error
        if (image?.path && fs.existsSync(image.path)) {
            await fs.promises.unlink(image.path).catch(console.error);
        }
        if (error instanceof CustomError) {
            throw error;
        }
        throw new CustomError("Failed to update item image", 500);
    }
};

module.exports = {
    getItemsModel: getItems,
    getItemByIDModel: getItemByID,
    getItemsByCategoryIDModel: getItemsByCategoryID,
    createItemModel: createItem,
    updateItemImageModel: updateItemImage,
    getPaginatedItemsByCategoryIDModel: getPaginatedItemsByCategoryIDModel,
};
