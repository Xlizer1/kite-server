const { getRolesModel } = require("./model");
const { userExists, getUser, verifyPassword, resultObject, createToken, verify } = require("../../helpers/common");
const { registerUserSchema, loginUserSchema } = require("../../validators/userValidator");
const { ValidationError } = require("../../helpers/errors");

const getRoles = async (request, callBack) => {
  try {
    const authorize = await verify(request?.headers["jwt"]);
    if (!authorize?.id || !authorize?.email) {
      callBack(resultObject(false, "Token is invalid!"));
      return;
    } else {
      getRolesModel(authorize, result => {
        callBack(resultObject(true, "success", result));
      })
    }
  } catch (error) {
    callBack({
      status: false,
      message: "Something went wrong. Please try again later.",
    });
    console.log(error);
  }
};

module.exports = {
  getRolesController: getRoles,
};
