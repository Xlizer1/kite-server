const { registerUserModel, getUserByIdModel } = require("./model");
const { userExists, getUser, verifyPassword, resultObject, createToken, verify } = require("../../helpers/common");
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
      const isPasswordCorrect = await verifyPassword(password, user?.password); //first argument is the password from the body and the second argument is the hashed password stored in the database
      if (isPasswordCorrect) {
        callBack(resultObject(true, "success", { token: await createToken(user) }));
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

const getUserById = async (request, callBack) => {
  try {
    const { id } = request.params;

    if (!id || isNaN(id)) {
      throw new ValidationError("Invalid user ID provided.");
    }

    getUserByIdModel(id, (user) => {
      if (user && user?.id) {
        const object = {
          id: user?.id,
          name: user?.name,
          username: user?.username,
          email: user?.email,
          phone: user?.phone,
          role: {
            id: user?.role_id,
            name: user?.role_name,
          },
          restaurant: {
            id: user?.restaurant_id,
            id: user?.restaurant_name,
          },
        };
        callBack(resultObject(true, "success", object));
      } else {
        throw new ValidationError("User doesn't exist.");
      }
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      callBack(resultObject(false, error.message));
    } else {
      callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
  }
};

const registerUser = async (request, callBack) => {
  try {
    const authorize = await verify(request?.headers["jwt"]);
    if (!authorize?.id || !authorize?.email) {
      callBack(resultObject(false, "Token is invalid!"));
      return;
    } else {
      if (authorize?.role_id === 1 || authorize?.role_id === 2 || authorize?.role_id === 3) {
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
      } else {
        callBack(resultObject(false, "You don't have the permission to create a user!"));
        return;
      }
    }
  } catch (error) {
    if (error instanceof ValidationError) {
      callBack(resultObject(false, error.message));
    } else {
      callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
  }
};

module.exports = {
  getUserByIdController: getUserById,
  registerUserController: registerUser,
  loginUserController: loginUser,
};
