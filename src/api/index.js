const express = require("express");
const router = express.Router();

const v1Router = require("./v1");

router.use("/v1", (req, res, next) => {
    v1Router(req, res, next);
    console.log(req.method, req.baseUrl + req.url);
});

module.exports = router;
