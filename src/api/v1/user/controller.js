const { registerUserModel, updateUserModel, getUsersModel, getUserByIdModel, deleteUserModel } = require("./model");
const {
    userExists,
    getUser,
    verifyPassword,
    resultObject,
    createToken,
    verifyUserToken,
    getToken,
} = require("../../../helpers/common");
const { registerUserSchema, loginUserSchema } = require("../../../validators/userValidator");
const { ValidationError } = require("../../../helpers/errors");

const loginUser = async (request, callBack) => {
    try {
        // const { error } = loginUserSchema.validate(request.body);
        // if (error) {
        //   throw new ValidationError(error.details[0].message);
        // }

        const { username, password } = request.body;

        if (!username || !password) {
            callBack(resultObject(false, "Please provide username/password!"));
        }

        const user = await getUser(username);
        if (user && user?.id) {
            const isPasswordCorrect = await verifyPassword(password, user?.password);
            if (isPasswordCorrect) {
                callBack(
                    resultObject(true, "success", {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        department_id: user.department_id,
                        roles: user.roles,
                        token: await createToken(user),
                    })
                );
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
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        } else {
            const { id } = request.params;

            if (!id || isNaN(id)) {
                throw new ValidationError("Invalid user ID provided.");
            }

            const user = await getUserByIdModel(id); // Assuming getUserByIdModel returns a Promise

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
                        name: user?.restaurant_name, // Corrected `id` to `name`
                    },
                };
                callBack(resultObject(true, "success", object));
            } else {
                throw new ValidationError("User doesn't exist.");
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

const updateUser = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        } else {
            if (authorize?.roles?.includes(7)) {
                const id = request.params.id;
                const {
                    department_id,
                    restaurant_id,
                    parent_restaurant_id,
                    name,
                    username,
                    email,
                    phone,
                    enabled,
                    roles,
                } = request.body;

                const result = await updateUserModel({
                    department_id,
                    restaurant_id,
                    parent_restaurant_id,
                    name,
                    username,
                    email,
                    phone,
                    enabled,
                    roles,
                    id,
                    updated_id: authorize?.id,
                });

                if (result?.status === true) {
                    callBack(resultObject(true, "User updated successfully.", result.user));
                    return;
                } else {
                    callBack(resultObject(false, "Failed to update user."));
                    return;
                }
            } else {
                callBack(resultObject(false, "You don't have the permission to update a user!"));
                return;
            }
        }
    } catch (error) {
        console.log(error);
        if (error instanceof ValidationError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

const getUsers = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (authorize?.roles?.includes(5)) {
            const result = await getUsersModel();
            if (Array.isArray(result)) {
                callBack(resultObject(true, "success", result));
            } else {
                callBack(resultObject(false, "no users were found!"));
            }
        } else {
            callBack(resultObject(false, "You don't have the permission to see users!"));
            return;
        }
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
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        } else {
            if (authorize?.roles?.includes(6)) {
                const { error } = registerUserSchema.validate(request.body);
                if (error) {
                    throw new ValidationError(error.details[0].message);
                }

                const {
                    department_id,
                    restaurant_id,
                    parent_restaurant_id,
                    name,
                    username,
                    email,
                    phone,
                    password,
                    roles,
                } = request.body;

                const checkUserExists = await userExists(username, email, phone);
                if (checkUserExists) {
                    throw new ValidationError("User already exists.");
                }

                const result = await registerUserModel({
                    name,
                    email,
                    username,
                    phone,
                    password,
                    restaurant_id,
                    parent_restaurant_id,
                    department_id,
                    roles,
                    created_id: 0,
                });
                if (result?.status === true) {
                    callBack(resultObject(true, "User created successfully."));
                    return;
                } else {
                    callBack(resultObject(false, "Failed to create user."));
                    return;
                }
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
            console.log(error);
        }
    }
};

const deleteUser = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        } else {
            if (authorize?.roles?.includes(8)) {
                const { id } = request.params;

                const result = await deleteUserModel({ id, deleted_id: authorize?.id });
                if (result?.status === true) {
                    callBack(resultObject(true, "User deleted successfully."));
                    return;
                } else {
                    callBack(resultObject(false, "Failed to delete user."));
                    return;
                }
            } else {
                callBack(resultObject(false, "You don't have the permission to delete a user!"));
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
    getUsersController: getUsers,
    updateUserController: updateUser,
    deleteUserModel: deleteUser,
};
