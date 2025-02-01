const fs = require("fs");
const { executeTransaction, buildInsertQuery, buildUpdateQuery } = require("../../helpers/db");
const { executeQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");
const { IP, PORT } = process.env;

const ip = IP || "localhost";
const port = PORT || "8000";

const getRestaurants = async (user) => {
    try {
        let sql = `
            SELECT
                r.*,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', i.id,
                        'url', i.url,
                        'primary', rim.is_primary
                    )
                ) AS images
            FROM
                restaurants r
            LEFT JOIN
                restaurants_image_map rim ON r.id = rim.restaurant_id
            LEFT JOIN
                images i ON rim.image_id = i.id AND i.id IS NOT NULL AND i.url IS NOT NULL
            WHERE
                r.deleted_at IS NULL
        `;

        const params = [];
        
        if (user.department_id !== 1) {
            if (user.department_id === 2) {
                sql += ' AND r.id = ?';
                params.push(user.restaurant_id);
            } else {
                sql += ' AND r.parent_rest_id = ?';
                params.push(user.restaurant_id);
            }
        }

        sql += ' GROUP BY r.id';

        const result = await executeQuery(sql, params, "getRestaurants");

        if (Array.isArray(result) && result[0] === false) {
            return Promise.reject(new CustomError(result[1], 400));
        }

        if (Array.isArray(result)) {
            const parsedResult = result.map((row) => ({
                ...row,
                images: JSON.parse(row.images || "[]")?.filter((i) => i.id), // Ensure valid JSON for `images`
            }));
            return parsedResult;
        }

        return Promise.reject(new CustomError("An unknown error occurred during data read.", 500));
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const getRestaurantsByID = async (id, user) => {
    try {
        const sql = `
            SELECT
                r.*,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', i.id,
                        'url', i.url,
                        'primary', rim.is_primary
                    )
                ) AS images
            FROM
                restaurants r
            LEFT JOIN
                restaurants_image_map rim ON r.id = rim.restaurant_id
            LEFT JOIN
                images i ON rim.image_id = i.id AND i.id IS NOT NULL AND i.url IS NOT NULL
            WHERE
                r.id = ? AND r.deleted_at IS NULL
            GROUP BY
                r.id
        `;

        const params = [id];

        if (user.department_id !== 1) {
            if (user.department_id === 2) {
                sql += ' AND r.id = ?';
                params.push(user.restaurant_id);
            } else {
                sql += ' AND r.parent_rest_id = ?';
                params.push(user.restaurant_id);
            }
        }

        const result = await executeQuery(sql, params, "getRestaurantsByID");

        if (Array.isArray(result) && result[0] === false) {
            return Promise.reject(new CustomError(result[1], 400));
        }

        if (Array.isArray(result)) {
            const parsedResult = result.map((row) => ({
                ...row,
                images: JSON.parse(row.images || "[]")?.filter((i) => i.id), // Ensure valid JSON for `images`
            }));
            return parsedResult[0];
        }

        return Promise.reject(new CustomError("An unknown error occurred during registration.", 500));
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const createRestaurants = async (obj) => {
    const { name, description, tagline, images, creator_id } = obj;
    
    try {
        // Prepare the restaurant insert query
        const restaurantQuery = buildInsertQuery('restaurants', {
            name,
            description,
            tagline,
            created_at: new Date(),
            created_by: creator_id
        });

        // Prepare array to hold all queries
        const queries = [restaurantQuery];

        // Process images if they exist
        if (images?.length) {
            for (const [index, image] of images.entries()) {
                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
                if (!allowedTypes.includes(image.mimetype)) {
                    throw new CustomError(`Invalid file type for image: ${image.originalname}`, 400);
                }

                // Generate safe filename
                const ext = image.originalname.split('.').pop().toLowerCase();
                const imageName = `restaurant_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
                const targetPath = `uploads/restaurants/${imageName}`;

                // Move file with proper error handling
                await fs.promises.rename(image.path, targetPath);

                // Prepare image insert query
                const imageQuery = buildInsertQuery('images', {
                    url: `/uploads/restaurants/${imageName}`,
                    created_at: new Date(),
                    created_by: creator_id
                });

                // Add image query to transaction
                queries.push(imageQuery);

                // This will be filled with the image ID from the previous query
                queries.push({
                    sql: 'INSERT INTO restaurants_image_map (image_id, restaurant_id, is_primary, created_at, created_by) VALUES (LAST_INSERT_ID(), LAST_INSERT_ID(), ?, NOW(), ?)',
                    params: [index === 0, creator_id]
                });
            }
        }

        // Execute all queries in a transaction
        await executeTransaction(queries, 'createRestaurants');
        return true;

    } catch (error) {
        // Clean up any uploaded files in case of error
        if (images?.length) {
            for (const image of images) {
                if (image.path) {
                    await fs.promises.unlink(image.path).catch(console.error);
                }
            }
        }
        throw error;
    }
};

const updateRestaurants = async (obj) => {
    try {
        const { id, name, description, tagline, images, updater_id } = obj;

        // Prepare the restaurant update query
        const updateData = {
            name,
            description,
            tagline,
            updated_at: new Date(),
            updated_by: updater_id
        };

        const { sql: updateSql, params: updateParams } = buildUpdateQuery('restaurants', updateData, { id });
        
        // Prepare array to hold all queries
        const queries = [{ sql: updateSql, params: updateParams }];

        // Process images if they exist
        if (images?.length) {
            for (const [index, image] of images.entries()) {
                // Validate file type
                const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
                if (!allowedTypes.includes(image.mimetype)) {
                    throw new CustomError(`Invalid file type for image: ${image.originalname}`, 400);
                }

                // Generate safe filename
                const ext = image.originalname.split('.').pop().toLowerCase();
                const imageName = `restaurant_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
                const targetPath = `uploads/restaurants/${imageName}`;

                // Move file with proper error handling
                await fs.promises.rename(image.path, targetPath);

                // Prepare image insert query
                const imageQuery = buildInsertQuery('images', {
                    url: `/uploads/restaurants/${imageName}`,
                    created_at: new Date(),
                    created_by: updater_id
                });

                // Add image query to transaction
                queries.push(imageQuery);

                // This will be filled with the image ID from the previous query
                queries.push({
                    sql: 'INSERT INTO restaurants_image_map (image_id, restaurant_id, is_primary, created_at, created_by) VALUES (LAST_INSERT_ID(), ?, ?, NOW(), ?)',
                    params: [id, index === 0, updater_id]
                });
            }
        }

        // Execute all queries in a transaction
        await executeTransaction(queries, 'updateRestaurants');
        return true;

    } catch (error) {
        // Clean up any uploaded files in case of error
        if (images?.length) {
            for (const image of images) {
                if (image.path) {
                    await fs.promises.unlink(image.path).catch(console.error);
                }
            }
        }
        throw error;
    }
};

const deleteRestaurants = async (id, user_id) => {
    try {
        const { sql, params } = buildUpdateQuery('restaurants', 
            {
                deleted_at: new Date(),
                deleted_by: user_id,
                updated_at: new Date(),
                updated_by: user_id
            },
            { id }
        );

        const result = await executeQuery(sql, params, "deleteRestaurants");
        return result.affectedRows > 0;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

module.exports = {
    getRestaurantsModel: getRestaurants,
    getRestaurantsByIDModel: getRestaurantsByID,
    createRestaurantsModel: createRestaurants,
    updateRestaurantsModel: updateRestaurants,
    deleteRestaurantsModel: deleteRestaurants,
};
