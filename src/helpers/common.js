var db = require("../config/db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { TOKEN_KEY, EXPIRES_IN, SALT_ROUNDS } = process.env;

const tokenKey = TOKEN_KEY || "cyka";
const tokenExpiry = EXPIRES_IN || "12h";
const saltRounds = SALT_ROUNDS || 10;

const hash = (text) => {
  return new Promise(async (resolve, reject) => {
    try {
      const hashedText = await bcrypt.hash(text, saltRounds);
      resolve(hashedText);
    } catch (error) {
      reject("An error occured while hashing: ", error);
    }
  });
};

const verifyPassword = (password, hashedPassword) => {
  return new Promise(async (resolve, reject) => {
    try {
      const comparisonResult = await bcrypt.compare(password, hashedPassword);
      resolve(comparisonResult);
    } catch (error) {
      reject("An error occured while verifying password: ", error);
    }
  });
};

const createToken = (object) => {
  return new Promise(async (resolve, reject) => {
    try {
      const token = await jwt.sign({ data: object }, tokenKey, { expiresIn: tokenExpiry });
      resolve(token);
    } catch (error) {
      reject("An error occured while creating the token: ", error);
    }
  });
};

const resultObject = (status, message, data) => {
  return {
    status: status,
    message: message,
    data: data,
  };
};

const executeQuery = async (sql, logName, callback) => {
  try {
    await db.query(
      {
        sql: sql,
        timeout: 40000,
      },
      (error, result) => {
        if (!error) {
          callback(result);
        } else {
          console.error(`${logName}sql: ${sql}`);
          console.error(logName + ": " + error);
          callback([false, error?.message]);
        }
      }
    );
  } catch (e) {
    console.log("Error in common.js -> executeQuery: " + e);
  }
};

const userExists = (username, email, phone) => {
  return new Promise(async (resolve) => {
    let sql = `
      SELECT
        *
      FROM
        users
      WHERE
        (username = "${username}" OR email = "${email}" OR phone = "${phone}")
    `;
    await executeQuery(sql, "userExists", (result) => {
      if (result && result?.length) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

const getUser = (username) => {
  return new Promise(async (resolve) => {
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
        u.username = "${username}"
    `;
    await executeQuery(sql, "getUser", (result) => {
      if (result && result?.length) {
        resolve(result[0]);
      } else {
        resolve(null);
      }
    });
  });
};

module.exports = { hash, executeQuery, userExists, getUser, verifyPassword, resultObject, createToken };
