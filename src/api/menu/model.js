const { executeQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const getRestaurantMainMenu = (restaurant_id, number) => {
  return new Promise(async (resolve, reject) => {
    let sql = `
    `;

    const result = await executeQuery(sql, "getRestaurantMainMenu");

    if (Array.isArray(result) && result[0] === false) {
      return reject(new CustomError(result[1], 400));
    }

    if (Array.isArray(result)) {
      return resolve(result);
    }

    return reject(new CustomError("An unknown error occurred during registration.", 500));
  });
};

module.exports = {
  getRestaurantMainMenuModel: getRestaurantMainMenu,
};
