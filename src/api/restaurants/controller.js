const { getRestaurantsModel, createRestaurantsModel, getRestaurantsByIDModel, updateRestaurantsModel, deleteRestaurantsModel } = require("./model");
const { resultObject, verify } = require("../../helpers/common");

const getRestaurants = async (request, callBack) => {
  try {
    const authorize = await verify(request?.headers["jwt"]);
    if (!authorize?.id || !authorize?.email) {
      callBack(resultObject(false, "Token is invalid!"));
      return;
    } else {
      if (authorize?.roles?.includes(1)) {
        const result = await getRestaurantsModel(authorize);
        if (result && result[0] && result?.length > 0) {
          callBack(resultObject(true, "success", result));
        } else {
          callBack(resultObject(true, "No restaurants found.", []));
        }
      } else {
        callBack(resultObject(false, "You don't have the permission to view restaurants!"));
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

const getRestaurantsByID = async (request, callBack) => {
  try {
    const authorize = await verify(request?.headers["jwt"]);
    if (!authorize?.id || !authorize?.email) {
      callBack(resultObject(false, "Token is invalid!"));
      return;
    } else {
      if (authorize?.roles?.includes(1)) {
        const { id } = request.params;
        const result = await getRestaurantsByIDModel(id, authorize);
        if (result && result?.id) {
          callBack(resultObject(true, "success", result));
        } else {
          callBack(resultObject(false, "Restaurant not found."));
        }
      } else {
        callBack(resultObject(false, "You don't have the permission to view restaurants!"));
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
        const result = await createRestaurantsModel({ name, tagline, description, creator_id: authorize?.id });
        if (result) {
          callBack(resultObject(true, "success"));
        } else {
          callBack(resultObject(false, "Failed to create restaurant."));
        }
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
        const result = await updateRestaurantsModel({ id, name, tagline, description, updater_id: authorize?.id});
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
        const result = await deleteRestaurantsModel(id, authorize?.id);
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
  getRestaurantsByIDController: getRestaurantsByID,
  createRestaurantsController: createRestaurants,
  updateRestaurantsController: updateRestaurants,
  deleteRestaurantsController: deleteRestaurants,
};
