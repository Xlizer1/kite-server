const { handleError } = require("./src/middleware/errorHandler");

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const homeRouter = require("./src/api/home/router");
const userRouter = require("./src/api/user/router");
const rolesRouter = require("./src/api/roles/router");
const restaurantsRouter = require("./src/api/restaurants/router");
const tablesRouter = require("./src/api/tables/router");
const menuRouter = require("./src/api/menu/router");
const categoriesRouter = require("./src/api/categories/router");
const subCategoriesRouter = require("./src/api/sub_categories/router");
const itemsRouter = require("./src/api/items/router");

app.use("/uploads", express.static(__dirname + "/uploads"));

app.use(
  "/uploads/files",
  express.static(path.join(__dirname, "/../../../uploads"))
);

app.use("/", homeRouter);
app.use("/user", userRouter);
app.use("/roles", rolesRouter);
app.use("/restaurants", restaurantsRouter);
app.use("/tables", tablesRouter);
app.use("/menu", menuRouter);
app.use("/categories", categoriesRouter);
app.use("/sub_categories", subCategoriesRouter);
app.use("/items", itemsRouter);

app.use(handleError);

module.exports = app;
