const { getTablesModel, createTablesModel, getTablesByIDModel, updateTablesModel, deleteTablesModel } = require("./model");
const { resultObject, verify } = require("../../helpers/common");

const getTables = async (request, callBack) => {
  try {
    const authorize = await verify(request?.headers["jwt"]);
    if (!authorize?.id || !authorize?.email) {
      callBack(resultObject(false, "Token is invalid!"));
      return;
    } else {
      if (authorize?.roles?.includes(1)) {
        getTablesModel(authorize, (result) => {
          callBack(resultObject(true, "success", result));
        });
      } else {
        callBack(resultObject(false, "You don't have the permission to view Tables!"));
        return;
      }
    }
  } catch (error) {
    callBack({
      status: false,
      message: "Something went wrong. Please try again later.",
    });
    console.log(error);
  }
};

const getTablesByID = async (request, callBack) => {
  try {
    const authorize = await verify(request?.headers["jwt"]);
    console.log(authorize);
    if (!authorize?.id || !authorize?.email) {
      callBack(resultObject(false, "Token is invalid!"));
      return;
    } else {
      if (authorize?.roles?.includes(1)) {
        const { id } = request.params;
        const result = await getTablesByIDModel(id);
        console.log(result);
      } else {
        callBack(resultObject(false, "You don't have the permission to view Tables!"));
        return;
      }
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
    const authorize = await verify(request?.headers["jwt"]);
    if (!authorize?.id || !authorize?.email) {
      callBack(resultObject(false, "Token is invalid!"));
      return;
    } else {
      if (authorize?.roles?.includes(2)) {
        const result = await createTablesModel({ ...request?.body, creator_id: authorize?.id });
        if (result) {
          callBack(resultObject(true, "success"));
        }
      } else {
        callBack(resultObject(false, "You don't have the permission to create a table!"));
        return;
      }
    }
  } catch (error) {
    callBack({
      status: false,
      message: "Something went wrong. Please try again later.",
    });
    console.log(error);
  }
};

const updateTables = async (request, callBack) => {
  try {
    const authorize = await verify(request?.headers["jwt"]);
    if (!authorize?.id || !authorize?.email) {
      callBack(resultObject(false, "Token is invalid!"));
      return;
    } else {
      if (authorize?.roles?.includes(3)) {
        const { id } = request?.params;
        const result = await createTablesModel({ ...request?.body, table_id: id, updater_id: authorize?.id });
        if (result) {
          callBack(resultObject(true, "success"));
        } else {
          callBack(resultObject(false, "Failed to update table."));
        }
      } else {
        callBack(resultObject(false, "You don't have the permission to update a table!"));
        return;
      }
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
    const authorize = await verify(request?.headers["jwt"]);
    if (!authorize?.id || !authorize?.email) {
      callBack(resultObject(false, "Token is invalid!"));
      return;
    } else {
      if (authorize?.roles?.includes(4)) {
        const { id } = request?.params;
        const result = await deleteTablesModel(id, authorize?.id);
        if (result) {
          callBack(resultObject(true, "success"));
        } else {
          callBack(resultObject(false, "Failed to delete table."));
        }
      } else {
        callBack(resultObject(false, "You don't have the permission to delete a table!"));
        return;
      }
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
  getTablesByIDController: getTablesByID,
  createTablesController: createTables,
  updateTablesController: updateTables,
  deleteTablesController: deleteTables,
};
