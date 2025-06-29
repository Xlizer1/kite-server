const fs = require("fs");
const { executeTransaction, buildInsertQuery, buildUpdateQuery } = require("../../../helpers/db");
const { executeQuery } = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");
const { IP, PORT } = process.env;

const ip = IP || "localhost";
const port = PORT || "8000";

const getRestaurants = async (request, user) => {
    try {
        const { page = 1, limit = 10, search = "", sort_by = "created_at", sort_order = "DESC" } = request.query || {};

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        const conditions = ["r.deleted_at IS NULL"];
        const params = [];

        // Search functionality
        if (search && search.trim()) {
            conditions.push(`(
                r.name LIKE ? OR
                r.description LIKE ? OR
                r.address LIKE ? OR
                r.phone LIKE ?
            )`);
            const searchParam = `%${search.trim()}%`;
            params.push(searchParam, searchParam, searchParam, searchParam);
        }

        // Department-based filtering (keeping original logic)
        if (user.department_id !== 1) {
            if (user.department_id === 2) {
                conditions.push("r.id = ?");
                params.push(user.restaurant_id);
            } else {
                conditions.push("r.parent_rest_id = ?");
                params.push(user.restaurant_id);
            }
        }

        // Sorting validation
        const allowedSortFields = ["id", "name", "description", "created_at", "updated_at"];
        const sortField = allowedSortFields.includes(sort_by) ? sort_by : "created_at";
        const sortDirection = sort_order.toUpperCase() === "ASC" ? "ASC" : "DESC";
        const sortColumn = `r.${sortField}`;

        const whereClause = conditions.join(" AND ");

        const dataQuery = `
            SELECT
                r.*,
                IF(
                COUNT(i.id) > 0,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                    'id', i.id,
                    'url', i.url,
                    'primary', rim.is_primary
                    )
                ),
                NULL
                ) AS images
            FROM
                restaurants r
                LEFT JOIN restaurants_image_map rim ON r.id = rim.restaurant_id
                LEFT JOIN images i ON i.id = rim.image_id
            WHERE
                ${whereClause}
            GROUP BY r.id
            ORDER BY
                ${sortColumn} ${sortDirection}
            LIMIT ? OFFSET ?
        `;

        const countQuery = `
            SELECT COUNT(DISTINCT r.id) as total
            FROM
                restaurants r
                LEFT JOIN restaurants_image_map rim ON r.id = rim.restaurant_id
                LEFT JOIN images i ON i.id = rim.image_id
            WHERE
                ${whereClause}
        `;

        const dataParams = [...params, limitNum, offset];
        const countParams = [...params];

        const [result, countResult] = await Promise.all([
            executeQuery(dataQuery, dataParams, "getRestaurants"),
            executeQuery(countQuery, countParams, "getRestaurantsCount"),
        ]);

        // Handle executeQuery errors
        if (Array.isArray(result) && result[0] === false) {
            return Promise.reject(new CustomError(result[1], 400));
        }

        if (Array.isArray(countResult) && countResult[0] === false) {
            return Promise.reject(new CustomError(countResult[1], 400));
        }

        if (!Array.isArray(result)) {
            return Promise.reject(new CustomError("An unknown error occurred during data read.", 500));
        }

        // Parse result to ensure valid JSON for images
        const parsedResult = result.map((row) => ({
            ...row,
            images: row.images?.filter((i) => i.id) || [], // Ensure valid JSON for images
        }));

        const total = countResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limitNum);

        return {
            data: parsedResult,
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
                sort_by: sortField,
                sort_order: sortDirection,
            },
        };
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const getRestaurantsByID = async (id, user) => {
    try {
        const sql = `
            SELECT
                r.*,
                CASE 
                    WHEN COUNT(i.id) > 0 THEN
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'id', i.id,
                                'url', i.url,
                                'primary', rim.is_primary
                            )
                        )
                    ELSE NULL
                END AS images
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
                sql += " AND r.id = ?";
                params.push(user.restaurant_id);
            } else {
                sql += " AND r.parent_rest_id = ?";
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
                images: row.images?.filter((i) => i.id) || [], // Ensure valid JSON for `images`
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
        const restaurantQuery = buildInsertQuery("restaurants", {
            name,
            description,
            tagline,
            created_at: new Date(),
            created_by: creator_id,
        });

        // Prepare array to hold all queries
        const queries = [restaurantQuery];

        // Process images if they exist
        if (images?.length) {
            for (const [index, image] of images.entries()) {
                // Validate file type
                const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
                if (!allowedTypes.includes(image.mimetype)) {
                    throw new CustomError(`Invalid file type for image: ${image.originalname}`, 400);
                }

                // Generate safe filename
                const ext = image.originalname.split(".").pop().toLowerCase();
                const imageName = `restaurant_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
                const targetPath = `uploads/restaurants/${imageName}`;

                // Move file with proper error handling
                await fs.promises.rename(image.path, targetPath);

                // Prepare image insert query
                const imageQuery = buildInsertQuery("images", {
                    url: `/uploads/restaurants/${imageName}`,
                    created_at: new Date(),
                    created_by: creator_id,
                });

                // Add image query to transaction
                queries.push(imageQuery);

                // This will be filled with the image ID from the previous query
                queries.push({
                    sql: "INSERT INTO restaurants_image_map (image_id, restaurant_id, is_primary, created_at, created_by) VALUES (LAST_INSERT_ID(), LAST_INSERT_ID(), ?, NOW(), ?)",
                    params: [index === 0, creator_id],
                });
            }
        }

        // Execute all queries in a transaction
        await executeTransaction(queries, "createRestaurants");
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
            updated_by: updater_id,
        };

        const { sql: updateSql, params: updateParams } = buildUpdateQuery("restaurants", updateData, { id });

        // Prepare array to hold all queries
        const queries = [{ sql: updateSql, params: updateParams }];

        // Process images if they exist
        if (images?.length) {
            for (const [index, image] of images.entries()) {
                // Validate file type
                const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
                if (!allowedTypes.includes(image.mimetype)) {
                    throw new CustomError(`Invalid file type for image: ${image.originalname}`, 400);
                }

                // Generate safe filename
                const ext = image.originalname.split(".").pop().toLowerCase();
                const imageName = `restaurant_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
                const targetPath = `uploads/restaurants/${imageName}`;

                // Move file with proper error handling
                await fs.promises.rename(image.path, targetPath);

                // Prepare image insert query
                const imageQuery = buildInsertQuery("images", {
                    url: `/uploads/restaurants/${imageName}`,
                    created_at: new Date(),
                    created_by: updater_id,
                });

                // Add image query to transaction
                queries.push(imageQuery);

                // This will be filled with the image ID from the previous query
                queries.push({
                    sql: "INSERT INTO restaurants_image_map (image_id, restaurant_id, is_primary, created_at, created_by) VALUES (LAST_INSERT_ID(), ?, ?, NOW(), ?)",
                    params: [id, index === 0, updater_id],
                });
            }
        }

        // Execute all queries in a transaction
        await executeTransaction(queries, "updateRestaurants");
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
        const { sql, params } = buildUpdateQuery(
            "restaurants",
            {
                deleted_at: new Date(),
                deleted_by: user_id,
                updated_at: new Date(),
                updated_by: user_id,
            },
            { id }
        );

        const result = await executeQuery(sql, params, "deleteRestaurants");
        return result.affectedRows > 0;
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const updateRestaurantImage = async (restaurant_id, image, user_id) => {
    try {
        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
        if (!allowedTypes.includes(image.mimetype)) {
            throw new CustomError(`Invalid file type for image: ${image.originalname}`, 400);
        }

        // Generate safe filename
        const ext = image.originalname.split(".").pop().toLowerCase();
        const imageName = `restaurant_${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`;
        const targetPath = `${__dirname}/../../../uploads/restaurants/${imageName}`;

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
            [`/uploads/restaurants/${imageName}`, user_id],
            "insertRestaurantImage"
        );
        const image_id = imageResult.insertId;

        // Update existing primary images to non-primary
        await executeQuery(
            "UPDATE restaurants_image_map SET is_primary = 0 WHERE restaurant_id = ? AND is_primary = 1",
            [restaurant_id],
            "updateOldPrimaryImage"
        );

        // Insert new image mapping
        await executeQuery(
            "INSERT INTO restaurants_image_map (image_id, restaurant_id, is_primary, created_at, created_by) VALUES (?, ?, 1, NOW(), ?)",
            [image_id, restaurant_id, user_id],
            "insertRestaurantImageMap"
        );

        // Fetch and return updated restaurant info
        const selectSql = `
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
                r.id = ?
            GROUP BY
                r.id
        `;

        const result = await executeQuery(selectSql, [restaurant_id], "getUpdatedRestaurantInfo");

        if (!result || result.length === 0) {
            throw new CustomError("Restaurant not found", 404);
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
        throw new CustomError("Failed to update restaurant image", 500);
    }
};

module.exports = {
    getRestaurantsModel: getRestaurants,
    getRestaurantsByIDModel: getRestaurantsByID,
    createRestaurantsModel: createRestaurants,
    updateRestaurantsModel: updateRestaurants,
    deleteRestaurantsModel: deleteRestaurants,
    updateRestaurantImageModel: updateRestaurantImage,
};
