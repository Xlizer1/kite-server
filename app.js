const { handleError } = require("./src/middleware/errorHandler");
const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

app.use(
    cors({
        origin: ["http://localhost:3000", "https://yourdomain.com"],
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
        optionsSuccessStatus: 200,
    })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set up static file directories
app.use("/uploads", express.static(__dirname + "/uploads"));
app.use("/uploads/files", express.static(path.join(__dirname, "/../../../uploads")));

// Create API router - all routes will be prefixed with /api
const apiRouter = express.Router();
app.use("/api", apiRouter);

// Import routers
const homeRouter = require("./src/api/home/router");
const userRouter = require("./src/api/user/router");
const rolesRouter = require("./src/api/roles/router");
const restaurantsRouter = require("./src/api/restaurants/router");
const tablesRouter = require("./src/api/tables/router");
const menuRouter = require("./src/api/menu/router");
const categoriesRouter = require("./src/api/categories/router");
const subCategoriesRouter = require("./src/api/sub_categories/router");
const itemsRouter = require("./src/api/items/router");
const inventoryItemsRouter = require("./src/api/inventory/router");
const IngredientsRouter = require("./src/api/ingredients/router");
const settingRouter = require("./src/api/setting/router");

// Mount all routers to the API router without repeating /api
apiRouter.use("/", homeRouter);
apiRouter.use("/user", userRouter);
apiRouter.use("/roles", rolesRouter);
apiRouter.use("/restaurants", restaurantsRouter);
apiRouter.use("/tables", tablesRouter);
apiRouter.use("/menu", menuRouter);
apiRouter.use("/categories", categoriesRouter);
apiRouter.use("/sub_categories", subCategoriesRouter);
apiRouter.use("/items", itemsRouter);
apiRouter.use("/inventory", inventoryItemsRouter);
apiRouter.use("/ingredients", IngredientsRouter);
apiRouter.use("/setting", settingRouter);

app.use(handleError);

module.exports = app;
