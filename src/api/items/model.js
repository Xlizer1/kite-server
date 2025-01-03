const fs = require("fs");
const { executeQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const getItems = async (restaurant_id) => {
    return new Promise(async (resolve, reject) => {
        let sql = `
            SELECT
                i.*
            FROM
                items i
            WHERE
                i.restaurant_id = ${restaurant_id}
        `;
        const result = await executeQuery(sql, "getItems");
        if (result && result.length) {
            resolve(result);
        } else {
            reject(new CustomError("No items found for the given sub-category", 404));
        }

        return reject(new CustomError("An unknown error occurred during registration.", 500));
    });
}

const getItemsBySubCategoryID = async (restaurant_id, sub_category_id) => {
    return new Promise(async (resolve, reject) => {
        let sql = `
            SELECT
                i.*
            FROM
                items i
            WHERE
                i.restaurant_id = ${restaurant_id}
            AND 
                i.sub_category_id = ${sub_category_id}
        `;
        const result = await executeQuery(sql, "getItems");
        if (result && result.length) {
            resolve(result);
        } else {
            reject(new CustomError("No items found for the given sub-category", 404));
        }

        return reject(new CustomError("An unknown error occurred during registration.", 500));
    });
}

const createItem = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { name, description, price, restaurant_id, sub_category_id, is_shisha, images, creator_id } = data;
        let sql = `
            INSERT INTO 
                items (
                    name,
                    description,
                    price,
                    restaurant_id, 
                    sub_category_id,
                    is_shisha,
                    created_at,
                    created_by
                )
            VALUES (
                "${name}",
                "${description}",
                ${price},
                ${restaurant_id},
                ${sub_category_id},
                ${JSON.parse(is_shisha) ? true : false},
                NOW(),
                ${creator_id}
            )
        `;

        const result = await executeQuery(sql, "createItem");

        if (result?.insertId) {
            if (images?.length) {
                let index = 0;
                for (const image of images) {
                    var tmp_path = image.path;
                    var image_ext = image.originalname.split(".").pop();
                    var image_name = "items_" + result?.insertId + "_" + Date.now();
                    var target_path = "uploads/items/" + image_name + "." + image_ext;
                    var src = fs.createReadStream(tmp_path);
                    var dest = fs.createWriteStream(target_path);
                    src.pipe(dest);

                    let sql = `
                      INSERT INTO
                        images
                      SET
                        url = "/${target_path}",
                        created_at = NOW(),
                        created_by = ${creator_id}
                    `;
                    const imageResult = await executeQuery(sql, "item image");
                    if (imageResult?.insertId) {
                        let sql = `
                        INSERT INTO
                          items_image_map
                        SET
                          image_id = ${imageResult?.insertId},
                          item_id = ${result?.insertId},
                          is_primary = ${index === 0},
                          created_at = NOW(),
                          created_by = ${creator_id}
                      `;
                        await executeQuery(sql, "registerUser");
                        index++;
                    }
                }
            }
            return resolve(true);
        }

        return reject(new CustomError("An unknown error occurred during registration.", 500));
    });
};

module.exports = {
    getItemsModel: getItems,
    getItemsBySubCategoryIDModel: getItemsBySubCategoryID,
    createItemModel: createItem,
};
