const { getRestaurantMainMenuModel } = require("./model");
const { resultObject, verify, processTableEncryptedKey } = require("../../helpers/common");

const getRestaurantMainMenu = async (request, callBack) => {
  try {
    const authorize = await verify(request?.headers["jwt"]);
    if (!authorize?.id || !authorize?.email) {
      callBack(resultObject(false, "Token is invalid!"));
      return;
    } else {
      if (authorize?.roles?.includes(1)) {
        const { key } = request.query;
        if (!key || typeof key !== "string") {
          callBack(resultObject(false, "Invalid Table Key!"));
          return;
        }
        const { restaurant_id, number } = await processTableEncryptedKey(key);

        if (!number || !restaurant_id) {
          callBack(resultObject(false, "Invalid Table"));
          return;
        }

        const result = await getRestaurantMainMenuModel(restaurant_id, number);

        if (result) {
          callBack(resultObject(true, "success", result));
        } else {
          callBack(resultObject(false, "Restaurant not found."));
        }
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
  getRestaurantMainMenuController: getRestaurantMainMenu,
};
