const { handleError } = require("./src/middleware/errorHandler");

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const homeRouter = require("./src/api/home/router");
const userRouter = require("./src/api/user/router");
const rolesRouter = require("./src/api/roles/router");

app.use("/", homeRouter);
app.use("/user", userRouter);
app.use("/roles", rolesRouter);

app.use(handleError);

module.exports = app;
