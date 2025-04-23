const {
    getRolesModel,
    createRolesModel,
    updateRolesModel,
    updateUserPermissionsModel,
    deleteRolesModel,
} = require("./model");
const { resultObject, verifyUserToken } = require("../../helpers/common");

const getRoles = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"]);
        const result = await getRolesModel(authorize);
        if (Array.isArray(result)) {
            callBack(resultObject(true, "success", result));
        } else {
            callBack(resultObject(false, "an error happened", result));
        }
    } catch (error) {
        callBack({
            status: false,
            message: "Something went wrong. Please try again later.",
        });
        console.log(error);
    }
};

const createRoles = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"]);
        if (authorize?.roles?.includes(10)) {
            const { name } = request?.body;
            createRolesModel(name, (result) => {
                if (result) {
                    callBack(resultObject(true, "success"));
                }
            });
        } else {
            callBack(resultObject(false, "You don't have the permission to create a role!"));
            return;
        }
    } catch (error) {
        callBack({
            status: false,
            message: "Something went wrong. Please try again later.",
        });
        console.log(error);
    }
};

const updateRoles = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"]);
        if (authorize?.roles?.includes(11)) {
            const { id } = request?.params;
            const { name } = request?.body;
            const result = await updateRolesModel(id, name);
            if (result) {
                callBack(resultObject(true, "success"));
            } else {
                callBack(resultObject(false, "Failed to update role."));
            }
        } else {
            callBack(resultObject(false, "You don't have the permission to update a role!"));
            return;
        }
    } catch (error) {
        callBack({
            status: false,
            message: "Something went wrong. Please try again later.",
        });
        console.log(error);
    }
};

const updateUserPermissions = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"]);
        if (authorize?.roles?.includes(13)) {
            const { id } = request?.params;
            const { roles } = request?.body;
            const result = await updateUserPermissionsModel(id, roles);
            if (result) {
                callBack(resultObject(true, "success"));
            } else {
                callBack(resultObject(false, "Failed to update user permissions."));
            }
        } else {
            callBack(resultObject(false, "You don't have the permission to update user permissions!"));
            return;
        }
    } catch (error) {
        callBack({
            status: false,
            message: "Something went wrong. Please try again later.",
        });
        console.log(error);
    }
};

const deleteRoles = async (request, callBack) => {
    try {
        const authorize = await verifyUserToken(request?.headers["jwt"]);
        if (authorize?.roles?.includes(12)) {
            const { id } = request?.params;
            const result = await deleteRolesModel(id);
            if (result) {
                callBack(resultObject(true, "success"));
            } else {
                callBack(resultObject(false, "Failed to delete role."));
            }
        } else {
            callBack(resultObject(false, "You don't have the permission to delete a role!"));
            return;
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
    createRolesController: createRoles,
    updateRolesController: updateRoles,
    updateUserPermissionsController: updateUserPermissions,
    deleteRolesController: deleteRoles,
};
