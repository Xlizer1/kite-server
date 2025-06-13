const { executeQuery, executeTransaction, buildInsertQuery } = require("../../../helpers/db");
const { DatabaseError } = require("../../../errors/customErrors");

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
                    CASE 
                        WHEN item.id IS NOT NULL THEN
                            JSON_OBJECT(
                                'id', item.id,
                                'name', item.name,
                                'description', item.description,
                                'price', item.price,
                                'currency_code', curr.code,
                                'is_shisha', item.is_shisha,
                                'image_url', item_img.url,
                                'preparation_time', item.preparation_time,
                                'allergens', item.allergens,
                                'calories', item.calories,
                                'is_vegetarian', item.is_vegetarian,
                                'is_vegan', item.is_vegan,
                                'is_gluten_free', item.is_gluten_free
                            )
                        ELSE NULL
                    END
                ) AS items
            FROM
                categories c
            LEFT JOIN
                categories_image_map AS cim ON cim.category_id = c.id
            LEFT JOIN
                images AS i ON cim.image_id = i.id AND cim.is_primary = 1
            LEFT JOIN
                items AS item ON item.category_id = c.id AND item.deleted_at IS NULL
            LEFT JOIN
                currencies AS curr ON item.currency_id = curr.id
            LEFT JOIN
                items_image_map AS iim ON iim.item_id = item.id AND iim.is_primary = 1
            LEFT JOIN
                images AS item_img ON iim.image_id = item_img.id
            WHERE
                c.restaurant_id = ?
            AND
                c.deleted_at IS NULL
            GROUP BY
                c.id, c.name, i.url
        `;

        const result = await executeQuery(sql, [restaurant_id], "getRestaurantCategories");

        // Filter out null items from the JSON array
        return result.map((category) => ({
            ...category,
            items: category.items ? category.items.filter((item) => item !== null) : [],
        }));
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

const listAvailableRestaurants = async () => {
    try {
        const sql = `
            SELECT
                r.id,
                r.name,
                r.description,
                r.tagline,
                r.lat,
                r.long,
                i.url AS image_url
            FROM
                restaurants r
            LEFT JOIN
                restaurants_image_map AS rim ON rim.restaurant_id = r.id
            LEFT JOIN
                images AS i ON rim.image_id = i.id AND rim.is_primary = 1
            WHERE
                r.deleted_at IS NULL
            ORDER BY
                r.name
        `;

        const result = await executeQuery(sql, [], "listAvailableRestaurants");
        return result;
    } catch (error) {
        throw new DatabaseError("Failed to fetch available restaurants", error);
    }
};

module.exports = {
    getRestaurantMainMenuModel: getRestaurantMainMenu,
    listAvailableRestaurantsModel: listAvailableRestaurants,
};
