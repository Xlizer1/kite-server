const { hash, executeQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const getUsers = (id) => {
  return new Promise((resolve, reject) => {
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

    executeQuery(sql, "getUserById", (result) => {
      if (Array.isArray(result) && !result[0]) {
        return reject(new CustomError(result[1], 400));
      }

      if (result && result.length > 0) {
        return resolve(result[0]);
      }

      return reject(new CustomError("User not found.", 404));
    });
  });
};

const getUserById = (id) => {
  return new Promise((resolve, reject) => {
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

    executeQuery(sql, "getUserById", (result) => {
      if (Array.isArray(result) && !result[0]) {
        return reject(new CustomError(result[1], 400));
      }

      if (result && result.length > 0) {
        return resolve(result[0]);
      }

      return reject(new CustomError("User not found.", 404));
    });
  });
};


const registerUser = async (user) => {
  const { name, username, email, phone, password, role_id, restaurant_id } = user;
  const passwordHash = await hash(password);

  let sql = `
    INSERT INTO
      users (
        name,
        username,
        email,
        phone,
        password,
        role_id,
        restaurant_id
      )
    VALUES (
      "${name}",
      "${username}",
      "${email}",
      "${phone}",
      "${passwordHash}",
      ${role_id},
      ${restaurant_id}
    )
  `;

  return new Promise((resolve, reject) => {
    executeQuery(sql, "registerUser", (result) => {
      if (Array.isArray(result) && !result[0]) {
        return reject(new CustomError(result[1], 400));
      }

      if (result && result?.insertId) {
        return resolve({
          status: true,
          message: "Registered Successfully!",
        });
      }

      return reject(new CustomError("An unknown error occurred during registration.", 500));
    });
  });
};


module.exports = {
  getUsersModel: getUsers,
  getUserByIdModel: getUserById,
  registerUserModel: registerUser,
};
