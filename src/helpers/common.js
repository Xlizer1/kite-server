const bcrypt = require("bcrypt");
var db = require("../config/db");

const { SALT, SALT_ROUNDS } = process.env;

const salt = SALT || "cyka";
const salt_rounds = SALT_ROUNDS || 10;

const hash = (text) => {
  return new Promise(async (resolve, reject) => {
    try {
      const hashedText = await bcrypt.hash(text, salt_rounds);
      resolve(hashedText);
    } catch (error) {
      reject("An error occured while hashing: ", error);
    }
  });
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

module.exports = { hash, executeQuery, userExists };
