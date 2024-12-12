const crypto = require("crypto");
const QRCode = require("qrcode");

const { executeQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const { IP, PORT, BASE_URL } = process.env;

const ip = IP || "localhost";
const port = PORT || "8000";

const baseUrl = BASE_URL || `http://${ip}:${port}`;

const getTables = async (user) => {
  return new Promise((resolve, reject) => {
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
        tables r
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

    executeQuery(sql, "getTables", (result) => {
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
  });
};

const getTablesByID = async (id, user) => {
  return new Promise((resolve, reject) => {
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
        tables r
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

    executeQuery(sql, "getTablesByID", (result) => {
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
  });
};

const createTables = async (obj) => {
  return new Promise((resolve, reject) => {
    const { restaurant_id, number, creator_id } = obj;

    const hash = crypto.createHash("sha256").update(JSON.stringify({ restaurant_id, number })).digest("hex");

    let sql = `
      INSERT INTO
        tables
      SET
        restaurant_id = ${restaurant_id},
        number = ${number},
        created_at = NOW(),
        created_by = ${creator_id}
    `;

    executeQuery(sql, "createTables", async (result) => {
      if (result?.insertId) {
        const qrCode = await QRCode.toDataURL(`${baseUrl}/${hash}`);
        let sql = `
          INSERT INTO
            qr_codes
          SET
            table_id = ${result?.insertId},
            qr_code = "${qrCode}",
            created_at = NOW(),
            created_by = ${creator_id}
        `;

        executeQuery(sql, "insertQRCode", async (qrCoderesult) => {
          try {
            if (!qrCoderesult?.insertId) {
              let sql = `
                DELETE FROM
                  tables
                WHERE
                  id = ${result?.insertId}
              `;
              executeQuery(sql, "insertQRCode", async () => {
                resolve(false);
              });
            } else {
              resolve(true);
            }
          } catch (err) {
            reject(new Error("Failed to generate QR code."));
          }
        });
      } else {
        return reject(new CustomError("An unknown error occurred during registration.", 500));
      }
    });
  });
};

const updateTables = async (obj) => {
  return new Promise((resolve, reject) => {
    const { id, name, tagline, description, updater_id } = obj;
    let sql = `
      UPDATE
        tables
      SET
        name = "${name}",
        tagline = "${tagline}",
        description = "${description}",
        updated_at = NOW(),
        updated_by = ${updater_id}
      WHERE
        id = ${id}
    `;
    executeQuery(sql, "updateTables", (result) => {
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
        tables
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
