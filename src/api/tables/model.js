const crypto = require("crypto");
const QRCode = require("qrcode");

const { executeQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const { IP, PORT, BASE_URL } = process.env;

const ip = IP || "localhost";
const port = PORT || "8000";

const baseUrl = BASE_URL || `http://${ip}:${port}`;

const getTables = () => {
  return new Promise(async (resolve, reject) => {
    let sql = `
      SELECT
        t.id,
        t.number,
        r.name,
        ts.name AS status,
        qr.qr_code
      FROM
        tables t
      LEFT JOIN
        qr_codes qr ON t.id = qr.table_id
      LEFT JOIN
        restaurants r ON t.restaurant_id = r.id
      LEFT JOIN
        table_statuses ts ON t.status = ts.id
      WHERE
        t.deleted_at IS NULL
    `;

    const result = await executeQuery(sql, "getTables");
    if (Array.isArray(result) && result[0] === false) {
      return reject(new CustomError(result[1], 400));
    }

    if (Array.isArray(result)) {
      return resolve(result);
    }

    return reject(new CustomError("An unknown error occurred during data read.", 500));
  });
};

const getTablesByID = (id, user) => {
  return new Promise(async (resolve, reject) => {
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

    const result = await executeQuery(sql, "getTablesByID");
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
};

const createTables = async (obj) => {
  return new Promise(async (resolve, reject) => {
    const { restaurant_id, number, creator_id } = obj;

    try {
      let checkSql = `
        SELECT
          id
        FROM
          tables
        WHERE
          restaurant_id = ${restaurant_id} AND number = ${number}
      `;
      const existingTable = await executeQuery(checkSql, "checkExistingTable");

      if (existingTable.length > 0) {
        return resolve({
          status: false,
          message: "A table with the same number already exists for this restaurant.",
        });
      }

      const hash = crypto
        .createHash("sha256")
        .update(JSON.stringify({ restaurant_id, number }))
        .digest("hex");

      let tableSql = `
        INSERT INTO
          tables
        SET
          restaurant_id = ${restaurant_id},
          number = ${number},
          created_at = NOW(),
          created_by = ${creator_id}
      `;
      const tableResult = await executeQuery(tableSql, "createTables");

      if (tableResult?.insertId) {
        const tableId = tableResult.insertId;

        const qrCode = await QRCode.toDataURL(`${baseUrl}/${hash}`);

        let qrSql = `
          INSERT INTO
            qr_codes
          SET
            table_id = ${tableId},
            qr_code = "${qrCode}",
            created_at = NOW(),
            created_by = ${creator_id}
        `;
        const qrResult = await executeQuery(qrSql, "insertQRCode");

        if (!qrResult?.insertId) {
          let deleteSql = `
            DELETE FROM
              tables
            WHERE
              id = ${tableId}
          `;
          await executeQuery(deleteSql, "rollbackTable");
          return resolve({
            status: false,
            message: "Failed to insert QR code; rolled back table creation.",
          });
        } else {
          return resolve({
            status: true,
            message: "Table and QR code created successfully.",
          });
        }
      } else {
        return reject(new CustomError("An unknown error occurred during table creation.", 500));
      }
    } catch (error) {
      reject(new Error("Failed to create table and QR code."));
    }
  });
};

const updateTables = (obj) => {
  return new Promise(async (resolve, reject) => {
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
    const result = await executeQuery(sql, "updateTables");
    if (result && result.affectedRows > 0) {
      return resolve(true);
    }

    return reject(new CustomError("An unknown error occurred during roles update.", 500));
  });
};

const deleteTables = (id, user_id) => {
  return new Promise(async (resolve, reject) => {
    let sql = `
      UPDATE
        tables
      SET
        deleted_at = Now(),
        deleted_by = ${user_id}
      WHERE
        id = ${id}
    `;

    const result = await executeQuery(sql, "deleteTables");
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
  getTablesModel: getTables,
  getTablesByIDModel: getTablesByID,
  createTablesModel: createTables,
  updateTablesModel: updateTables,
  deleteTablesModel: deleteTables,
};
