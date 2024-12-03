const { executeQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const getRestaurants = async (user, callBack) => {
  let sql = `
    SELECT
      *
    FROM
      restaurants
  `;
  
  executeQuery(sql, "registerUser", (result) => {
    if (Array.isArray(result) && !result[0]) {
      return callBack(new CustomError(result[1], 400));
    }

    if (Array.isArray(result)) {
      return callBack(result);
    }

    return callBack(new CustomError("An unknown error occurred during registration.", 500));
  });
};

const createRestaurants = async (name, callBack) => {
  let sql = `
    INSERT INTO
      restaurants
    SET
      name = "${name}"
  `;
  
  executeQuery(sql, "registerUser", (result) => {
    if (Array.isArray(result) && !result[0]) {
      return callBack(new CustomError(result[1], 400));
    }

    if (Array.isArray(result)) {
      return callBack(true);
    }

    return callBack(new CustomError("An unknown error occurred during registration.", 500));
  });
};

const updateRestaurants = async (obj, user_id) => {
  return new Promise((resolve, reject) => {
    const { id, name, tagline, description } = obj;
    let sql = `
      UPDATE
        restaurants
      SET
        name = "${name}",
        tagline = "${tagline}",
        description = "${description}",
        updated_at = NOW(),
        updated_by = ${user_id},
      WHERE
        id = ${id}
    `;
    executeQuery(sql, "updateRestaurants", result => {
      if (Array.isArray(result) &&!result[0]) {
        return reject(new CustomError(result[1], 400));
      }
      
      if (result && result.affectedRows > 0) {
        return resolve(true);
      }
      
      return reject(new CustomError("An unknown error occurred during roles update.", 500));
    })
  })
}

const deleteRestaurants = async (id, user_id) => {
  return new Promise((resolve, reject) => {
    let sql = `
      UPDATE
        restaurants
      SET
        deleted_at = Now(),
        deleted_by = ${user_id}
      WHERE
        id = ${id}
    `;
    executeQuery(sql, "deleteRestaurants", result => {
      if (Array.isArray(result) &&!result[0]) {
        return reject(new CustomError(result[1], 400));
      }
      
      if (result && result.affectedRows > 0) {
        return resolve(true);
      }
      
      return reject(new CustomError("An unknown error occurred during roles deletion.", 500));
    })
  })
}

module.exports = {
  getRestaurantsModel: getRestaurants,
  createRestaurantsModel: createRestaurants,
  updateRestaurantsModel: updateRestaurants,
  deleteRestaurantsModel: deleteRestaurants,
};
