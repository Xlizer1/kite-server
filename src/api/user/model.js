const { hash, executeQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const getUsers = (id) => {
  return new Promise(async (resolve, reject) => {
    let sql = `
      SELECT
        u.*,
        u.password AS hashedPassword, 
        r.id,
        r.name AS role_name,
        rest.name AS restaurant_name
      FROM
        users u
      LEFT JOIN
        roles r ON r.id = u.role_id
      LEFT JOIN
        restaurant rest ON rest.id = u.restaurant_id
      WHERE
        u.id = ${id}
    `;

    const result = await executeQuery(sql, "getUserById");
    if (Array.isArray(result) && !result[0]) {
      return reject(new CustomError(result[1], 400));
    }

    if (result && result.length > 0) {
      return resolve(result[0]);
    }

    return reject(new CustomError("User not found.", 404));
  });
};

const getUserById = (id) => {
  return new Promise(async (resolve, reject) => {
    let sql = `
      SELECT
        u.*,
        u.password AS hashedPassword, 
        r.id,
        r.name AS role_name,
        rest.name AS restaurant_name
      FROM
        users u
      LEFT JOIN
        roles r ON r.id = u.role_id
      LEFT JOIN
        restaurant rest ON rest.id = u.restaurant_id
      WHERE
        u.id = ${id}
    `;

    const result = await executeQuery(sql, "getUserById");
    if (Array.isArray(result) && !result[0]) {
      return reject(new CustomError(result[1], 400));
    }

    if (result && result.length > 0) {
      return resolve(result[0]);
    }

    return reject(new CustomError("User not found.", 404));
  });
};

const updateUser = (obj) => {
  return new Promise(async (resolve, reject) => {
    var passwordHash = await hash(obj.newPassword);

    let sql = `
      UPDATE
        users
      SET
        name = "${obj.name}",
        username = "${obj.username}",
        email = "${obj.email}",
        phone = "${obj.phone}",
        password = "${passwordHash}",
        department_id = ${obj.department_id},
        parent_restaurant_id = ${obj.parent_restaurant_id ? obj.parent_restaurant_id : "NULL"},
        restaurant_id = ${obj.restaurant_id},
        updated_at = NOW(),
        updated_by = ${obj.updated_id}
      WHERE
        id = ${obj.id}
    `;

    const result = await executeQuery(sql, "updateUser");
    if (Array.isArray(result) && !result[0]) {
      return reject(new CustomError(result[1], 400));
    }

    if (result && result.affectedRows > 0) {
      if (obj?.roles && obj?.roles.length > 0 && obj?.roles.every((role) => typeof role === "number")) {
        const deleteResult = await executeQuery(`DELETE FROM permissions WHERE user_id = ${obj.id}`, "deleting user roles");
        let roleSql = `
            INSERT INTO
              permissions (
                user_id,
                role_id
              )
            VALUES
              ${obj?.roles.map((role) => `(${obj.id}, ${role})`).join(",")}
          `;
        const result = await executeQuery(roleSql, "inserting user roles");
        return resolve({
          status: true,
          message: "Updated Successfully!",
        });
      } else {
        return resolve({
          status: true,
          message: "Updated Successfully, couldn't insert user roles!",
        });
      }
    }

    return reject(new CustomError("An unknown error occurred during user update.", 500));
  });
};

const registerUser = async (user) => {
  const { department_id, restaurant_id, parent_restaurant_id, name, username, email, phone, password, roles, created_id } = user;
  const passwordHash = await hash(password);

  let sql = `
    INSERT INTO
      users (
        name,
        username,
        email,
        phone,
        password,
        restaurant_id,
        department_id,
        enabled,
        created_at,
        created_by
      )
    VALUES (
      "${name}",
      "${username}",
      "${email}",
      "${phone}",
      "${passwordHash}",
      ${restaurant_id},
      ${department_id},
      ${1},
      Now(),
      ${created_id}
    )
  `;

  return new Promise(async (resolve, reject) => {
    const result = await executeQuery(sql, "registerUser");
    if (Array.isArray(result) && !result[0]) {
      return reject(new CustomError(result[1], 400));
    }

    if (result && result?.insertId) {
      if (roles && roles.length > 0 && roles.every((role) => typeof role === "number")) {
        let roleSql = `
            INSERT INTO
              permissions (
                user_id,
                role_id
              )
            VALUES
              ${roles.map((role) => `(${result.insertId}, ${role})`).join(",")}
          `;
        const rolesResult = await executeQuery(roleSql, "inserting userr roles");
        return resolve({
          status: true,
          message: "Registered Successfully!",
        });
      } else {
        return resolve({
          status: true,
          message: "Registered Successfully, couldn't insert user roles!",
        });
      }
    }

    return reject(new CustomError("An unknown error occurred during registration.", 500));
  });
};

const deleteUser = (obj) => {
  return new Promise(async (resolve, reject) => {
    let sql = `
      UPDATE
        users
      SET
        deleted_at = NOW(),
        deleted_by = ${obj.deleted_id}
      WHERE
        id = ${obj.id}
    `;
    const result = await executeQuery(sql, "deleteUser");
    if (Array.isArray(result) && !result[0]) {
      return reject(new CustomError(result[1], 400));
    }

    if (result && result.affectedRows > 0) {
      return resolve({
        status: true,
        message: "User deleted successfully!",
      });
    }

    return reject(new CustomError("An unknown error occurred during user deletion.", 500));
  });
};

module.exports = {
  getUsersModel: getUsers,
  getUserByIdModel: getUserById,
  registerUserModel: registerUser,
  updateUserModel: updateUser,
  deleteUserModel: deleteUser,
};
