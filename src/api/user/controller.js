const { registerUserModel } = require("./model");
const { userExists } = require("../../helpers/common");

const registerUser = async (request, callBack) => {
  const { name, email, username, phone, password, role_id } = request.body;
  const checkUserExists = await userExists(username, email, phone);
  if (checkUserExists) {
    callBack({
      status: false,
      message: "User already exists!",
    });
    return;
  }
  registerUserModel({ name, email, username, phone, password, role_id }, (result) => {
    callBack(result);
  });
};

module.exports = {
  registerUserController: registerUser,
};
