const { executeQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const getRestaurants = async (user) => {
  return new Promise(async (resolve, reject) => {
    let sql = `
      SELECT
        r.*,
        JSON_ARRAYAGG (
          JSON_OBJECT (
            'id', i.id,
            'url', i.url,
            'primary', rim.is_primary
          )
        ) AS images
      FROM
        restaurants r
      LEFT JOIN
        restaurants_image_map rim ON r.id = rim.restaurant_id
      LEFT JOIN
        images i ON rim.image_id = i.id AND i.id IS NOT NULL AND i.url IS NOT NULL
      WHERE
        r.deleted_at IS NULL
    `;

    if (user.department_id !== 1) {
      if (user.department_id === 2) {
        sql += `
          AND r.id = ${user.restaurant_id}
        `;
      } else {
        sql += `
          AND r.parent_rest_id = ${user.restaurant_id}
        `;
      }
    }

    sql += `
      GROUP BY
        r.id;
    `;

    const result = await executeQuery(sql, "getRestaurants");

    if (Array.isArray(result) && result[0] === false) {
      return reject(new CustomError(result[1], 400));
    }

    if (Array.isArray(result)) {
      const parsedResult = result.map((row) => ({
        ...row,
        images: JSON.parse(row.images || "[]")?.filter((i) => i.id), // Ensure valid JSON for `images`
      }));
      return resolve(parsedResult);
    }

    return reject(new CustomError("An unknown error occurred during data read.", 500));
  });
};

const getRestaurantsByID = async (id, user) => {
  return new Promise(async (resolve, reject) => {
    let sql = `
      SELECT
        r.*,
        JSON_ARRAYAGG (
          JSON_OBJECT (
            'id', i.id,
            'url', i.url,
            'primary', rim.is_primary
          )
        ) AS images
      FROM
        restaurants r
      LEFT JOIN
        restaurants_image_map rim ON r.id = rim.restaurant_id
      LEFT JOIN
        images i ON rim.image_id = i.id AND i.id IS NOT NULL AND i.url IS NOT NULL
      WHERE
        r.deleted_at IS NULL
      AND
        r.id = ${id}
    `;

    if (user.department_id !== 1) {
      if (user.department_id === 2) {
        sql += `
          AND r.id = ${user.restaurant_id}
        `;
      } else {
        sql += `
          AND r.parent_rest_id = ${user.restaurant_id}
        `;
      }
    }

    sql += `
      GROUP BY
        r.id;
    `;

    const result = await executeQuery(sql, "getRestaurantsByID");
    if (Array.isArray(result) && result[0] === false) {
      return reject(new CustomError(result[1], 400));
    }

    if (Array.isArray(result)) {
      const parsedResult = result.map((row) => ({
        ...row,
        images: JSON.parse(row.images || "[]")?.filter((i) => i.id), // Ensure valid JSON for `images`
      }));
      return resolve(parsedResult[0]);
    }

    return reject(new CustomError("An unknown error occurred during registration.", 500));
  });
};

const createRestaurants = async (obj) => {
  return new Promise(async (resolve, reject) => {
    const { name, description, tagline, creator_id } = obj;
    let sql = `
      INSERT INTO
        restaurants
      SET
        name = "${name}",
        description = "${description}",
        tagline = "${tagline}",
        created_at = NOW(),
        created_by = ${creator_id}
    `;

    const result = await executeQuery(sql, "registerUser");
    if (result?.insertId) {
      return resolve(true);
    }

    return reject(new CustomError("An unknown error occurred during registration.", 500));
  });
};

const updateRestaurants = async (obj) => {
  return new Promise(async (resolve, reject) => {
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
    const result = await executeQuery(sql, "updateRestaurants");
    if (result && result.affectedRows > 0) {
      return resolve(true);
    }

    return reject(new CustomError("An unknown error occurred during roles update.", 500));
  });
};

const deleteRestaurants = async (id, user_id) => {
  return new Promise(async (resolve, reject) => {
    let sql = `
      UPDATE
        restaurants
      SET
        deleted_at = Now(),
        deleted_by = ${user_id}
      WHERE
        id = ${id}
    `;

    const result = await executeQuery(sql, "deleteRestaurants");
    
    if (Array.isArray(result) && !result[0]) {
      return reject(new CustomError(result[1], 400));
    }

    if (result && result.affectedRows > 0) {
      return resolve(true);
    }

    return reject(new CustomError("An unknown error occurred during roles deletion.", 500));
  });
};

module.exports = {
  getRestaurantsModel: getRestaurants,
  getRestaurantsByIDModel: getRestaurantsByID,
  createRestaurantsModel: createRestaurants,
  updateRestaurantsModel: updateRestaurants,
  deleteRestaurantsModel: deleteRestaurants,
};
