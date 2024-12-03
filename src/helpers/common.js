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
      bcrypt
        .hash(text, typeof saltRounds === "string" ? JSON.parse(saltRounds) : saltRounds)
        .then((hashedText) => resolve(hashedText))
        .catch((e) => console.log(e));
    } catch (error) {
      reject(`An error occurred while hashing: ${error.message}`);
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
      delete object?.password;
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

const verify = (token) => {
  return new Promise((resolve, reject) => {
    try {
      var data = jwt.verify(token, tokenKey).data;
      if (data)
        checkDataTokenValidation(data, (result) => {
          if (result) resolve(data);
          else resolve(null);
        });
      else resolve(data);
    } catch (e) {
      resolve(null);
      console.log(e);
    }
  });
};

function checkDataTokenValidation(data, callback) {
  var sql = `
    SELECT 
      enabled 
    FROM 
      users 
    WHERE 
      id = ${data.id} 
    AND 
      deleted_at IS NULL`;
  executeQuery(sql, "checkDataTokenValidation", (result) => {
    if (result && result.length > 0 && result[0].enabled) callback(true);
    else callback(false);
  });
}

const getUserPermissions = (user_id) => {
  return new Promise(async (resolve) => {
    let sql = `
      SELECT
        r.id
      FROM
        permissions p
      LEFT JOIN
        roles r ON r.id = p.role_id
      LEFT JOIN
        users u ON u.id = p.user_id
      WHERE
        u.id = ${user_id}
    `;
    await executeQuery(sql, "getUser", (result) => {
      if (result && result?.length) {
        resolve(result?.map((r) => r?.id));
      } else {
        resolve([]);
      }
    });
  });
};

const getUser = (username) => {
  return new Promise(async (resolve) => {
    let sql = `
      SELECT
        u.*,
        d.id as role_id,
        d.name AS role_name,
        rest.name AS restaurant_name
      FROM
        users u
      LEFT JOIN
        departments d ON d.id = u.department_id
      LEFT JOIN
        restaurants rest ON rest.id = u.restaurant_id
      WHERE
        u.username = "${username}"
    `;
    await executeQuery(sql, "getUser", async (result) => {
      if (result && result?.length && result[0]) {
        let user = result[0];
        const permissions = await getUserPermissions(user?.id);
        resolve({ ...user, roles: permissions });
      } else {
        resolve(null);
      }
    });
  });
};

module.exports = { hash, executeQuery, userExists, getUser, verifyPassword, resultObject, createToken, verify };
