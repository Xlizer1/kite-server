const version = require("../../../package.json").version;
const { hash, executeQuery } = require("../../helpers/common");

const loginUser = async (user, callBack) => {
  const { name, email, phone, password, role_id } = user;
  const passwordHash = await hash(password);
  let sql = `
    INSERT INTO
      users (
        name,
        email,
        phone,
        password,
        role_id
      )
    VALUES (
      "${name}",
      "${email}",
      "${phone}",
      "${passwordHash}",
      ${role_id}
    )
  `;
  executeQuery(sql, "registerUser", (result) => {
    if (result && result?.insertId) {
      callBack({
        status: true,
        message: "Registered Successfuly!",
      });
    }
  });
};

const registerUser = async (user, callBack) => {
  const { name, username, email, phone, password, role_id } = user;
  const passwordHash = await hash(password);
  let sql = `
    INSERT INTO
      users (
        name,
        username,
        email,
        phone,
        password,
        role_id
      )
    VALUES (
      "${name}",
      "${username}",
      "${email}",
      "${phone}",
      "${passwordHash}",
      ${role_id}
    )
  `;
  executeQuery(sql, "registerUser", (result) => {
    if (result && result?.insertId) {
      callBack({
        status: true,
        message: "Registered Successfuly!",
      });
    }
  });
};

module.exports = {
  registerUserModel: registerUser,
};
