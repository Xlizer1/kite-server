const { executeQuery, executeTransaction, buildInsertQuery } = require("../../helpers/db");
const { DatabaseError } = require("../../errors/customErrors");

const getRestaurantInfo = async (restaurant_id) => {
    try {
        const sql = `
            SELECT
                r.id,
                r.name,
                r.description,
                r.tagline,
                i.url AS image_url
            FROM
                restaurants r
            LEFT JOIN
                restaurants_image_map AS rim ON rim.restaurant_id = r.id
            LEFT JOIN
                images AS i ON rim.image_id = i.id AND rim.is_primary = 1
            WHERE
                r.id = ?
        `;

        const results = await executeQuery(sql, [restaurant_id], "getRestaurantInfo");

        if (!results || results.length === 0) {
            throw new DatabaseError(`Restaurant not found with ID: ${restaurant_id}`);
        }

        const restaurantInfo = results[0];
        if (!restaurantInfo.name) {
            throw new DatabaseError(`Restaurant name is missing for ID: ${restaurant_id}`);
        }

        return restaurantInfo;
    } catch (error) {
        if (error instanceof DatabaseError) {
            throw error;
        }
        throw new DatabaseError("Failed to fetch restaurant info data", error);
    }
};

const getRestaurantSettings = async (restaurant_id) => {
    try {
        const sql = `
            SELECT
                rs.primary_color,
                rs.secondary_color
            FROM
                restaurant_settings rs
            WHERE
                restaurant_id = ?
        `;

        const result = await executeQuery(sql, [restaurant_id], "getRestaurantSettings");
        return result[0];
    } catch (error) {
        throw new DatabaseError("Failed to fetch restaurant settings data", error);
    }
};

const getRestaurantCategories = async (restaurant_id) => {
    try {
        const sql = `
            SELECT
                c.id,
                c.name,
                i.url AS image_url,
                JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', sc.id,
                        'name', sc.name,
                        'image_url', isc.url
                    )
                ) AS sub_categories
            FROM
                categories c
            LEFT JOIN
                categories_image_map AS cim ON cim.category_id = c.id
            LEFT JOIN
                images AS i ON cim.image_id = i.id AND cim.is_primary = 1
            LEFT JOIN
                sub_categories AS sc ON sc.category_id = c.id
            LEFT JOIN
                sub_categories_image_map AS scim ON scim.sub_category_id = sc.id
            LEFT JOIN
                images AS isc ON scim.image_id = isc.id AND scim.is_primary = 1
            WHERE
                c.restaurant_id = ?
            GROUP BY
                c.id, c.name, i.url
        `;

        const result = await executeQuery(sql, [restaurant_id], "getRestaurantCategories");
        return result;
    } catch (error) {
        throw new DatabaseError("Failed to fetch restaurant categories data", error);
    }
};

const getRestaurantMainMenu = async (restaurant_id, number) => {
    try {
        const restaurantInfo = await getRestaurantInfo(restaurant_id);
        const restaurantSettings = await getRestaurantSettings(restaurant_id);
        const restaurantCategories = await getRestaurantCategories(restaurant_id);

        if (!restaurantSettings) {
            throw new DatabaseError(`Restaurant settings not found for ID: ${restaurant_id}`);
        }

        if (!restaurantSettings.primary_color) {
            throw new DatabaseError(`Restaurant primary color setting is missing for ID: ${restaurant_id}`);
        }

        if (!Array.isArray(restaurantCategories)) {
            throw new DatabaseError(`Invalid categories data for restaurant ID: ${restaurant_id}`);
        }

        return {
            ...restaurantInfo,
            ...restaurantSettings,
            categories: restaurantCategories,
        };
    } catch (error) {
        if (error instanceof DatabaseError) {
            throw error;
        }
        throw new DatabaseError("Failed to fetch restaurant menu", error);
    }
};

module.exports = {
    getRestaurantMainMenuModel: getRestaurantMainMenu,
};
