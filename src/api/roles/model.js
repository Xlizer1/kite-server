const { hash, executeQuery } = require("../../helpers/common");
const { CustomError } = require("../../middleware/errorHandler");

const getRoles = async (user, callBack) => {
  let sql = `
    SELECT
      *
    FROM
      roles
    WHERE
      roles.id > ${user?.role_id}
  `;
  
  executeQuery(sql, "registerUser", (result) => {
    if (Array.isArray(result) && !result[0]) {
      return callBack(new CustomError(result[1], 400));
    }

    if (Array.isArray(result)) {
      return callBack(result);
    }

    return callBack(new CustomError("An unknown error occurred during registration.", 500));
  });
};

module.exports = {
  getRolesModel: getRoles,
};
