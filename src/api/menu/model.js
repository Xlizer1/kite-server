const { executeQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const getRestaurantInfo = (restaurant_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `
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
                r.id = ${restaurant_id}
            `;

            const result = await executeQuery(sql, "getRestaurantSettings");

            if (Array.isArray(result) && result[0] === false) {
                return reject(new CustomError(result[1], 400));
            }

            if (Array.isArray(result) && result.length) {
                return resolve(result[0]);
            }
        } catch (error) {
            return reject(new CustomError(error, 500));
        }
    });
};

const getRestaurantSettings = (restaurant_id) => {
    return new Promise(async (resolve, reject) => {
        let sql = `
          SELECT
            rs.primary_color,
            rs.secondary_color
          FROM
            restaurant_settings rs
          WHERE
            restaurant_id = ${restaurant_id}
        `;

        const result = await executeQuery(sql, "getRestaurantSettings");

        if (Array.isArray(result) && result[0] === false) {
            return reject(new CustomError(result[1], 400));
        }

        if (Array.isArray(result)) {
            return resolve(result[0]);
        }

        return reject(new CustomError("An unknown error occurred during registration.", 500));
    });
};

const getRestaurantCategories = (restaurant_id) => {
    return new Promise(async (resolve, reject) => {
        let sql = `
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
            c.restaurant_id = ${restaurant_id}
          GROUP BY
            c.id, c.name, i.url
        `;

        const result = await executeQuery(sql, "getRestaurantSettings");

        if (Array.isArray(result) && result[0] === false) {
            return reject(new CustomError(result[1], 400));
        }

        if (Array.isArray(result)) {
            return resolve(result?.map((r) => ({ ...r, sub_categories: JSON.parse(r.sub_categories) })));
        }

        return reject(new CustomError("An unknown error occurred during registration.", 500));
    });
};

const getRestaurantMainMenu = (restaurant_id, number) => {
    return new Promise(async (resolve, reject) => {
        const restaurarntInfo = await getRestaurantInfo(restaurant_id);
        const restaurarntSettings = await getRestaurantSettings(restaurant_id);
        const restaurarntCategories = await getRestaurantCategories(restaurant_id);

        if (restaurarntInfo?.name && restaurarntSettings?.primary_color) {
            return resolve({ ...restaurarntInfo, ...restaurarntSettings, categories: restaurarntCategories });
        }

        return reject(new CustomError("An unknown error occurred during registration.", 500));
    });
};

module.exports = {
    getRestaurantMainMenuModel: getRestaurantMainMenu,
};
