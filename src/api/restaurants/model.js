const { executeQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const getRestaurants = async () => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT
        *
      FROM
        restaurants r
      LEFT JOIN
        restaurant_type rt ON rt.id
    `;

    executeQuery(sql, "getRestaurants", (result) => {
      if (Array.isArray(result) && !result[0]) {
        return reject(new CustomError(result[1], 400));
      }

      if (Array.isArray(result)) {
        return resolve(result);
      }

      return reject(new CustomError("An unknown error occurred during data read.", 500));
    });
  });
};

const getRestaurantsByID = async (id) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT
        *
      FROM
        restaurants r
      WHERE
        r.id = ${id}
    `;

    executeQuery(sql, "getRestaurantsByID", (result) => {
      if (Array.isArray(result) && !result[0]) {
        return reject(new CustomError(result[1], 400));
      }

      if (Array.isArray(result)) {
        return resolve(result);
      }

      return reject(new CustomError("An unknown error occurred during registration.", 500));
    });
  });
};

const createRestaurants = async (obj) => {
  return new Promise((resolve, reject) => {
    const { name, description, tagline, creator_id } = obj;
    let sql = `
      INSERT INTO
        restaurants
      SET
        name = "${name}",
        description = "${description}",
        tagline = "${tagline}",
        type_id = 1,
        created_at = NOW(),
        created_by = ${creator_id}
    `;

    executeQuery(sql, "registerUser", (result) => {
      if (Array.isArray(result) && !result[0]) {
        return reject(new CustomError(result[1], 400));
      }

      if (Array.isArray(result)) {
        return resolve(true);
      }

      return reject(new CustomError("An unknown error occurred during registration.", 500));
    });
  });
};

const updateRestaurants = async (obj) => {
  return new Promise((resolve, reject) => {
    const { id, name, tagline, description, updater_id } = obj;
    let sql = `
      UPDATE
        restaurants
      SET
        name = "${name}",
        tagline = "${tagline}",
        description = "${description}",
        updated_at = NOW(),
        updated_by = ${updater_id}
      WHERE
        id = ${id}
    `;
    executeQuery(sql, "updateRestaurants", (result) => {
      if (Array.isArray(result) && !result[0]) {
        return reject(new CustomError(result[1], 400));
      }

      if (result && result.affectedRows > 0) {
        return resolve(true);
      }

      return reject(new CustomError("An unknown error occurred during roles update.", 500));
    });
  });
};

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
    executeQuery(sql, "deleteRestaurants", (result) => {
      if (Array.isArray(result) && !result[0]) {
        return reject(new CustomError(result[1], 400));
      }

      if (result && result.affectedRows > 0) {
        return resolve(true);
      }

      return reject(new CustomError("An unknown error occurred during roles deletion.", 500));
    });
  });
};

module.exports = {
  getRestaurantsModel: getRestaurants,
  getRestaurantsByIDModel: getRestaurantsByID,
  createRestaurantsModel: createRestaurants,
  updateRestaurantsModel: updateRestaurants,
  deleteRestaurantsModel: deleteRestaurants,
};
