const { getRestaurantsModel, createRestaurantsModel, updateRestaurantsModel, deleteRestaurantsModel } = require("./model");
const { resultObject, verify } = require("../../helpers/common");

const getRestaurants = async (request, callBack) => {
  try {
    const authorize = await verify(request?.headers["jwt"]);
    if (!authorize?.id || !authorize?.email) {
      callBack(resultObject(false, "Token is invalid!"));
      return;
    } else {
      if (authorize?.roles?.includes(1)) {
        getRestaurantsModel(authorize, (result) => {
          callBack(resultObject(true, "success", result));
        });
      } else {
        callBack(resultObject(false, "You don't have the permission to view roles!"));
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

const createRestaurants = async (request, callBack) => {
  try {
    const authorize = await verify(request?.headers["jwt"]);
    if (!authorize?.id || !authorize?.email) {
      callBack(resultObject(false, "Token is invalid!"));
      return;
    } else {
      if (authorize?.roles?.includes(2)) {
        const { name, tagline, description } = request?.body;
        createRestaurantsModel({ name, tagline, description }, authorize?.id, (result) => {
          if (result) {
            callBack(resultObject(true, "success"));
          }
        });
      } else {
        callBack(resultObject(false, "You don't have the permission to create a restaurant!"));
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

const updateRestaurants = async (request, callBack) => {
  try {
    const authorize = await verify(request?.headers["jwt"]);
    if (!authorize?.id || !authorize?.email) {
      callBack(resultObject(false, "Token is invalid!"));
      return;
    } else {
      if (authorize?.roles?.includes(3)) {
        const { id } = request?.params;
        const { name, tagline, description } = request?.body;
        const result = await updateRestaurantsModel({ id, name, tagline, description }, authorize?.id);
        if (result) {
          callBack(resultObject(true, "success"));
        } else {
          callBack(resultObject(false, "Failed to update restaurant."));
        }
      } else {
        callBack(resultObject(false, "You don't have the permission to update a restaurant!"));
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

const deleteRestaurants = async (request, callBack) => {
  try {
    const authorize = await verify(request?.headers["jwt"]);
    if (!authorize?.id || !authorize?.email) {
      callBack(resultObject(false, "Token is invalid!"));
      return;
    } else {
      if (authorize?.roles?.includes(4)) {
        const { id } = request?.params;
        const result = await deleteRestaurantsModel(id);
        if (result) {
          callBack(resultObject(true, "success"));
        } else {
          callBack(resultObject(false, "Failed to delete restaurant."));
        }
      } else {
        callBack(resultObject(false, "You don't have the permission to delete a restaurant!"));
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
  getRestaurantsController: getRestaurants,
  createRestaurantsController: createRestaurants,
  updateRestaurantsController: updateRestaurants,
  deleteRestaurantsController: deleteRestaurants,
};
