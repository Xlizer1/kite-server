const express = require("express");
const router = express.Router();

const homeRouter = require("./home/router");
const userRouter = require("./user/router");
const rolesRouter = require("./roles/router");
const restaurantsRouter = require("./restaurants/router");
const tablesRouter = require("./tables/router");
const menuRouter = require("./menu/router");
const categoriesRouter = require("./categories/router");
const subCategoriesRouter = require("./sub_categories/router");
const itemsRouter = require("./items/router");
const inventoryItemsRouter = require("./inventory/router");
const IngredientsRouter = require("./ingredients/router");
const settingRouter = require("./setting/router");
const cartRouter = require("./cart/router");
const captainRouter = require("./captain/router");

router.use("/", homeRouter);
router.use("/user", userRouter);
router.use("/roles", rolesRouter);
router.use("/restaurants", restaurantsRouter);
router.use("/tables", tablesRouter);
router.use("/menu", menuRouter);
router.use("/categories", categoriesRouter);
router.use("/sub_categories", subCategoriesRouter);
router.use("/items", itemsRouter);
router.use("/inventory", inventoryItemsRouter);
router.use("/ingredients", IngredientsRouter);
router.use("/setting", settingRouter);
router.use("/cart", cartRouter);
router.use("/captain", captainRouter);

module.exports = router;
