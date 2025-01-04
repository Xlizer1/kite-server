const { executeQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const getInventoryItems = (restaurant_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `
              SELECT
                i.id,
                i.restaurant_id,
                i.name,
                i.quantity,
                u.name AS unit_name,
                i.threshold,
                i.price,
                c.code AS currency_code,
                i.created_at,
                i.updated_at
              FROM
                inventory i
              LEFT JOIN
                units u ON i.unit_id = u.id
              LEFT JOIN
                currencies c ON i.currency_id = c.id
              WHERE
                i.restaurant_id = ${restaurant_id}
              AND
                i.deleted_at IS NULL
            `;

            const result = await executeQuery(sql, "getInventoryItems");

            if (Array.isArray(result) && result[0] === false) {
                return reject(new CustomError(result[1], 400));
            }

            resolve(result);
        } catch (error) {
            reject(new CustomError(error.message, 500));
        }
    });
};

const createInventoryItem = (itemData) => {
    return new Promise(async (resolve, reject) => {
        try {
            const { restaurant_id, name, quantity, unit_id, threshold, price, currency_id, created_by } = itemData;

            let sql = `
              INSERT INTO inventory 
              (restaurant_id, name, quantity, unit_id, threshold, price, currency_id, created_by)
              VALUES 
              (${restaurant_id}, '${name}', ${quantity}, ${unit_id}, ${threshold}, ${price}, ${currency_id}, ${created_by})
            `;

            const result = await executeQuery(sql, "createInventoryItem");

            if (Array.isArray(result) && result[0] === false) {
                return reject(new CustomError(result[1], 400));
            }

            resolve(result.insertId);
        } catch (error) {
            reject(new CustomError(error.message, 500));
        }
    });
};

module.exports = {
    getInventoryItemsModel: getInventoryItems,
    createInventoryItemModel: createInventoryItem
};
