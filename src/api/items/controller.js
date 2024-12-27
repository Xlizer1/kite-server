const { createItemModel } = require("./model");
const { resultObject, verify } = require("../../helpers/common");

const createItem = async (request, callBack) => {
    try {
        const authorize = await verify(request?.headers["jwt"]);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        } else {
            if (authorize?.roles?.includes(1)) {
                const { restaurant_id, sub_category_id, name, description, price, is_shisha } = request.body;
                const result = await createItemModel({ restaurant_id, sub_category_id, name, description, price, is_shisha, creator_id: authorize?.id });
                console.log(result);
                // if (result && result[0] && result?.length > 0) {
                //   callBack(resultObject(true, "success", result));
                // } else {
                //   callBack(resultObject(true, "No restaurants found.", []));
                // }
            } else {
                callBack(resultObject(false, "You don't have the permission to view restaurants!"));
                return;
            }
        }
    } catch (error) {
        callBack({
            status: false,
            message: "Something went wrong. Please try again later.",
        });
        console.log(error);
    }
};

module.exports = {
    createItemController: createItem,
};
