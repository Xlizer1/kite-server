const express = require("express");
const { getUsersController } = require("./controller");

const router = express.Router();

router.get("/", (req, res) => {
  getUsersController(req, (result) => {
    res.json(result);
  });
});

module.exports = router;
