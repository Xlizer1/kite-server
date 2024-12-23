var db = require("../config/db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const { TOKEN_KEY, EXPIRES_IN, SALT_ROUNDS } = process.env;

const tokenKey = TOKEN_KEY || "cyka";
const tokenExpiry = EXPIRES_IN || "12h";
const saltRounds = SALT_ROUNDS || 10;

// Define the encryption algorithm, key, and IV (Initialization Vector)
const algorithm = "aes-256-cbc";
const secretKey = Buffer.from(process.env.SECRET_KEY, 'hex');
const iv = crypto.randomBytes(16); // A 16-byte IV

function encryptObject(obj) {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(obj)), cipher.final()]);
  return {
    iv: iv.toString("hex"),
    encryptedData: encrypted.toString("hex"),
  };
}

function decryptObject(encrypted) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    secretKey,
    Buffer.from(encrypted.iv, "hex")
  );
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encrypted.encryptedData, "hex")),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString());
}

async function processTableEncryptedKey(qrData) {
  try {
    const [iv, encryptedData] = qrData.split(":"); // Split into iv and encryptedData

    return decryptObject({ iv, encryptedData });
  } catch (error) {
    console.error("Error processing QR code:", error);
    return null;
  }
}

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

const executeQuery = async (sql, logName) => {
  return new Promise(async (resolve, reject) => {
    try {
      await db.query(
        {
          sql: sql,
          timeout: 40000,
        },
        (error, result) => {
          if (!error) {
            resolve(result);
          } else {
            console.error(`${logName}sql: ${sql}`);
            console.error(logName + ": " + error);
            resolve([false, error?.message]);
          }
        }
      );
    } catch (e) {
      console.log("Error in common.js -> executeQuery: " + e);
    }
  });
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
    const result = await executeQuery(sql, "userExists");
    if (result && result?.length) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
};

const verify = (token) => {
  return new Promise((resolve, reject) => {
    try {
      var data = jwt.verify(token, tokenKey).data;
      if (data) {
        checkDataTokenValidation(data, (result) => {
          if (result) resolve(data);
          else resolve(null);
        });
      } else resolve(data);
    } catch (e) {
      resolve(null);
      console.log(e);
    }
  });
};

async function checkDataTokenValidation(data, callback) {
  var sql = `
    SELECT 
      enabled 
    FROM 
      users 
    WHERE 
      id = ${data.id} 
    AND 
      deleted_at IS NULL`;
  const result = await executeQuery(sql, "checkDataTokenValidation");
  if (result && result.length > 0 && result[0].enabled) callback(true);
  else callback(false);
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
    const result = await executeQuery(sql, "getUser");
    if (result && result?.length) {
      resolve(result?.map((r) => r?.id));
    } else {
      resolve([]);
    }
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
    const result = await executeQuery(sql, "getUser");
    if (result && result?.length && result[0]) {
      let user = result[0];
      const permissions = await getUserPermissions(user?.id);
      resolve({ ...user, roles: permissions });
    } else {
      resolve(null);
    }
  });
};

const checkCategoryForRestaurant = (restaurant_id, category_id) => {
  return new Promise(async (resolve) => {
    let sql = `
      SELECT
        id
      FROM
        categories
      WHERE
        restaurant_id = ${restaurant_id}
      AND
        id = ${category_id}
    `;
    const result = await executeQuery(sql, "checkCategoryForRestaurant");
    if (result && result?.length) {
      resolve(true);
    } else {
      resolve(false);
    }
  });
}

module.exports = { hash, executeQuery, userExists, getUser, verifyPassword, resultObject, createToken, verify, encryptObject, decryptObject, processTableEncryptedKey, checkCategoryForRestaurant };
