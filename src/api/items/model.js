const { executeQuery } = require("../../helpers/common");

const createItem = async (data) => {
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
            "${data.name}",
            "${data.description}",
            ${data.price},
            ${data.restaurant_id},
            ${data.sub_category_id},
            ${data.is_shisha ? true : false},
            NOW(),
            ${data.creator_id}
        )
    `;
};

module.exports = {
    createItemModel: createItem,
};
