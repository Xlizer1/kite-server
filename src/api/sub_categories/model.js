const fs = require("fs");
const { executeQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const { IP, PORT } = process.env;

const ip = IP || "localhost";
const port = PORT || "8000";
const createSubRestaurantCategory = (name, category_id, image, creator_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let sql = `
              INSERT INTO
                sub_categories
              SET
                name = "${name}",
                category_id = ${category_id},
                created_at = NOW(),
                created_by = ${creator_id}
            `;

            const result = await executeQuery(sql, "createSubRestaurantCategory");

            if (result?.insertId) {
                var tmp_path = image.path;
                var image_ext = image.originalname.split(".").pop();
                var image_name = "sub_categories_" + result?.insertId + "_" + Date.now();
                var target_path = "uploads/sub_categories/" + image_name + "." + image_ext;
                var src = fs.createReadStream(tmp_path);
                var dest = fs.createWriteStream(target_path);
                src.pipe(dest);

                let sql = `
                  INSERT INTO
                    images
                  SET
                    url = "http://${ip}:${port}/${target_path}",
                    created_at = NOW(),
                    created_by = ${creator_id}
                `;

                const imageResult = await executeQuery(sql, "images");

                if (imageResult?.insertId) {
                    let sql = `
                      INSERT INTO
                        sub_categories_image_map
                      SET
                        image_id = ${imageResult?.insertId},
                        sub_category_id = ${result?.insertId},
                        is_primary = 1,
                        created_at = NOW(),
                        created_by = ${creator_id}
                    `;
                    await executeQuery(sql, "sub_categories_image_map");
                }
                return resolve(result);
            } else {
                return resolve(false);
            }
        } catch (error) {
            console.log(error);
            return reject(new CustomError("An unknown error occurred during registration.", 500));
        }
    });
};

module.exports = {
    createSubRestaurantCategoryModel: createSubRestaurantCategory,
};
