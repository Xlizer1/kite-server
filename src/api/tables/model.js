const { executeQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const getTables = async () => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT
        *
      FROM
        tables t
    `;

    executeQuery(sql, "getTables", (result) => {
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

const getTablesByID = async (id) => {
  return new Promise((resolve, reject) => {
    let sql = `
      SELECT
        *
      FROM
        tables t
      WHERE
        r.id = ${id}
    `;

    executeQuery(sql, "getTablesByID", (result) => {
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

const createTables = async (obj) => {
  return new Promise((resolve, reject) => {
    const { qr_code_id, restaurant_id, branch_id, number, creator_id } = obj;
    let sql = `
      INSERT INTO
        tables
      SET
        qr_code_id = "${qr_code_id}",
        restaurant_id = "${restaurant_id}",
        branch_id = "${branch_id}",
        number = ${number},
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

const updateTables = async (obj) => {
  return new Promise((resolve, reject) => {
    const { table_id, restaurant_id, branch_id, number, updater_id } = obj;
    let sql = `
      UPDATE
        tables
      SET
        qr_code_id = "${qr_code_id}",
        restaurant_id = "${restaurant_id}",
        branch_id = "${branch_id}",
        number = ${number},
        updated_at = NOW(),
        updated_by = ${updater_id}
      WHERE
        id = ${table_id}
    `;
    executeQuery(sql, "updateTables", (result) => {
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

const deleteTables = async (id, user_id) => {
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
    executeQuery(sql, "deleteTables", (result) => {
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
  getTablesModel: getTables,
  getTablesByIDModel: getTablesByID,
  createTablesModel: createTables,
  updateTablesModel: updateTables,
  deleteTablesModel: deleteTables,
};
