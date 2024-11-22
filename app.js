const { handleError } = require("./src/middleware/errorHandler");

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const homeRouter = require("./src/api/home/router");
const userRouter = require("./src/api/user/router");

app.use("/", homeRouter);
app.use("/user", userRouter);

app.use(handleError);

module.exports = app;
