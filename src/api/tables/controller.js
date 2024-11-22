const { registerUserModel } = require("./model");
const { userExists, getUser, verifyPassword, resultObject, createToken } = require("../../helpers/common");
const { registerUserSchema, loginUserSchema } = require("../../validators/userValidator");
const { ValidationError } = require("../../helpers/errors");

const loginUser = async (request, callBack) => {
  try {
    const { error } = loginUserSchema.validate(request.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { username, password } = request.body;

    const user = await getUser(username);
    if (user && user?.id) {
      const { hashedPassword } = user;
      const isPasswordCorrect = await verifyPassword(password, hashedPassword);
      if (isPasswordCorrect) {
        const token = await createToken(user);
        const loginResultObject = {
          id: user?.id,
          name: user?.name,
          username: user?.username,
          email: user?.email,
          phone: user?.phone,
          role: {
            id: user?.role_id,
            name: user?.role_name
          },
          restaurant: {
            id: user?.restaurant_id,
            id: user?.restaurant_name
          },
          token: token,
        }
        callBack(resultObject(true, "success", loginResultObject));
      } else {
        callBack(resultObject(false, "Wrong Password!"));
      }
    } else {
      callBack(resultObject(false, "User Doesn't exist!"));
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      callBack({
        status: false,
        message: error.message,
      });
    } else {
      callBack({
        status: false,
        message: "Something went wrong. Please try again later.",
      });
    }
  }
};

const registerUser = async (request, callBack) => {
  try {
    const { error } = registerUserSchema.validate(request.body);
    if (error) {
      throw new ValidationError(error.details[0].message);
    }

    const { name, email, username, phone, password, role_id, restaurant_id } = request.body;

    const checkUserExists = await userExists(username, email, phone);
    if (checkUserExists) {
      throw new ValidationError("User already exists.");
    }

    registerUserModel({ name, email, username, phone, password, role_id, restaurant_id }, (result) => {
      callBack(result);
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      callBack({
        status: false,
        message: error.message,
      });
    } else {
      callBack({
        status: false,
        message: "Something went wrong. Please try again later.",
      });
    }
  }
};

module.exports = {
  registerUserController: registerUser,
  loginUserController: loginUser,
};
