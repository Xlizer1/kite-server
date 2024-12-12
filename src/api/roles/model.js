const { executeQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const getRoles = async (user, callBack) => {
  let sql = `
    SELECT
      *
    FROM
      roles
  `;

  const result = await executeQuery(sql, "registerUser");
  if (Array.isArray(result) && !result[0]) {
    return callBack(new CustomError(result[1], 400));
  }

  if (Array.isArray(result)) {
    return callBack(result);
  }

  return callBack(new CustomError("An unknown error occurred during registration.", 500));
};

const createRoles = async (name, callBack) => {
  let sql = `
    INSERT INTO
      roles
    SET
      name = "${name}"
  `;

  const result = await executeQuery(sql, "registerUser");
  if (Array.isArray(result) && !result[0]) {
    return callBack(new CustomError(result[1], 400));
  }

  if (Array.isArray(result)) {
    return callBack(true);
  }

  return callBack(new CustomError("An unknown error occurred during registration.", 500));
};

const updateRoles = (id, name) => {
  return new Promise(async (resolve, reject) => {
    let sql = `
      UPDATE
        roles
      SET
        name = "${name}"
      WHERE
        id = ${id}
    `;
    const result = await executeQuery(sql, "updateRoles");
    if (Array.isArray(result) && !result[0]) {
      return reject(new CustomError(result[1], 400));
    }

    if (result && result.affectedRows > 0) {
      return resolve(true);
    }

    return reject(new CustomError("An unknown error occurred during roles update.", 500));
  });
};

const updateUserPermissions = (id, roles) => {
  return new Promise(async (resolve, reject) => {
    const deleteResult = await executeQuery(`DELETE FROM permissions WHERE user_id = ${id}`, "deleting user roles");
    let roleSql = `
      INSERT INTO
        permissions (
          user_id,
          role_id
        )
      VALUES
        ${roles.map((role) => `(${id}, ${role})`).join(",")}
    `;
    const result = await executeQuery(roleSql, "inserting user roles");
    if (Array.isArray(result) && !result[0]) {
      return reject(new CustomError(result[1], 400));
    }

    if (result && result.affectedRows > 0) {
      return resolve(true);
    }

    return reject(new CustomError("An unknown error occurred during roles update.", 500));
  });
};

const deleteRoles = (id) => {
  return new Promise(async (resolve, reject) => {
    let sql = `
      DELETE FROM
        roles
      WHERE
        id = ${id}
    `;
    const result = await executeQuery(sql, "deleteRoles");
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
  getRolesModel: getRoles,
  createRolesModel: createRoles,
  updateRolesModel: updateRoles,
  updateUserPermissionsModel: updateUserPermissions,
  deleteRolesModel: deleteRoles,
};
