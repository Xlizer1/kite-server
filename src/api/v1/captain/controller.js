const { DatabaseError } = require("../../../errors/customErrors");
const { resultObject, verifyUserToken } = require("../../../helpers/common");
const { getRestaurantTablesModel } = require("./model");

const getRestaurantTablesController = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"], callBack);
        if (authorize?.roles?.includes(1)) {
            const result = await getRestaurantTablesModel(request);
            if (Array.isArray(result)) {
                callBack(resultObject(true, "success", result));
            } else {
                callBack(resultObject(false, "Something went wrong try agin later!"));
                console.log(result);
            }
        }
    } catch (error) {
        console.error(error);
        if (error instanceof DatabaseError) {
            callBack(false, error.message);
            return;
        }
        callBack(resultObject(false, "Something went wrong try agin later!"));
    }
};

module.exports = {
    getRestaurantTablesController,
};
