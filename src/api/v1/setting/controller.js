const { getUserByIdModel } = require("./model");
const { resultObject, verifyUserToken } = require("../../../helpers/common");
const { ValidationError } = require("../../../helpers/errors");

const getUserById = async (request, callBack) => {
    try {
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
};
