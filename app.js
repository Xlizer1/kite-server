const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const homeRouter = require("./src/home/router");

app.use("/", homeRouter);

module.exports = app;
