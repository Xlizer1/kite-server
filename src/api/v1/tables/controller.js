const { getTablesModel, createTablesModel, updateTablesModel, deleteTablesModel } = require("./model");
const { resultObject, verifyUserToken, getToken } = require("../../../helpers/common");

const getTables = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (authorize?.roles?.includes(1)) {
            const result = await getTablesModel(authorize.restaurant_id);
            if (result && result[0] && result?.length > 0) {
                callBack(resultObject(true, "success", result));
            } else {
                callBack(resultObject(true, "No restaurants found.", []));
            }
        } else {
            callBack(resultObject(false, "You don't have the permission to view restaurants!"));
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

const createTables = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(2)) {
            return callBack(resultObject(false, "You don't have permission to create a restaurant!"));
        }

        const { restaurant_id, number } = request?.body;

        const result = await createTablesModel({
            restaurant_id,
            number,
            creator_id: authorize.id,
        });

        if (result?.status) {
            return callBack(resultObject(true, "Table created successfully.", result));
        } else if (result?.message) {
            return callBack(resultObject(false, result.message));
        } else {
            return callBack(resultObject(false, "Failed to create table. Please try again."));
        }
    } catch (error) {
        console.error("Error in createTables controller:", error);
        return callBack({
            status: false,
            message: "Something went wrong. Please try again later.",
        });
    }
};

const updateTables = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (authorize?.roles?.includes(3)) {
            const { id } = request?.params;
            const { name, tagline, description } = request?.body;
            const result = await updateTablesModel({ id, name, tagline, description, updater_id: authorize?.id });
            if (result) {
                callBack(resultObject(true, "success"));
            } else {
                callBack(resultObject(false, "Failed to update restaurant."));
            }
        } else {
            callBack(resultObject(false, "You don't have the permission to update a restaurant!"));
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

const deleteTables = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (authorize?.roles?.includes(4)) {
            const { id } = request?.params;
            const result = await deleteTablesModel(id, authorize?.id);
            if (result) {
                callBack(resultObject(true, "success"));
            } else {
                callBack(resultObject(false, "Failed to delete restaurant."));
            }
        } else {
            callBack(resultObject(false, "You don't have the permission to delete a restaurant!"));
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
    getTablesController: getTables,
    createTablesController: createTables,
    updateTablesController: updateTables,
    deleteTablesController: deleteTables,
};
