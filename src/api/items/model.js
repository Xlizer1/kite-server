const { executeQuery } = require("../../helpers/common");

const createItem = async (data) => {
    return new Promise(async (resolve, reject) => {
        const { name, description, price, restaurant_id, sub_category_id, is_shisha, creator_id } = data;
        let sql = `
            INSERT INTO 
                items (
                    name,
                    description,
                    price,
                    restaurant_id, 
                    category_id,
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
                ${is_shisha ? true : false},
                NOW(),
                ${creator_id}
            )
        `;

        const result = await executeQuery(sql, "registerUser");

        if (result?.insertId) {
            if (images?.length) {
                let index = 0;
                for (const image of images) {
                    var tmp_path = image.path;
                    var image_ext = image.originalname.split(".").pop();
                    var image_name = "restaurant_" + result?.insertId + "_" + Date.now();
                    var target_path = "uploads/restaurarnts/" + image_name + "." + image_ext;
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
                    const imageResult = await executeQuery(sql, "registerUser");
                    if (imageResult?.insertId) {
                        let sql = `
                        INSERT INTO
                          restaurants_image_map
                        SET
                          image_id = ${imageResult?.insertId},
                          restaurant_id = ${result?.insertId},
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
    createItemModel: createItem,
};
