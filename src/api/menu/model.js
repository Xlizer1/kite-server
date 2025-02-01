const { executeQuery, executeTransaction, buildInsertQuery } = require("../../helpers/db");
const { CustomError } = require("../../middleware/errorHandler");

const getRestaurantInfo = async (restaurant_id) => {
    try {
        const sql = `
            SELECT
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

        return await executeQuery(sql, [restaurant_id], "getRestaurantInfo");
    } catch (error) {
        throw new CustomError(error.message, 500);
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

        return await executeQuery(sql, [restaurant_id], "getRestaurantSettings");
    } catch (error) {
        throw new CustomError(error.message, 500);
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
        return result?.map((r) => ({ ...r, sub_categories: JSON.parse(r.sub_categories) }));
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

const getRestaurantMainMenu = async (restaurant_id, number) => {
    try {
        const restaurantInfo = await getRestaurantInfo(restaurant_id);
        const restaurantSettings = await getRestaurantSettings(restaurant_id);
        const restaurantCategories = await getRestaurantCategories(restaurant_id);

        if (restaurantInfo?.name && restaurantSettings?.primary_color) {
            return { ...restaurantInfo, ...restaurantSettings, categories: restaurantCategories };
        }

        throw new CustomError("An unknown error occurred during registration.", 500);
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getRestaurantMainMenuModel: getRestaurantMainMenu,
};
