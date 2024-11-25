const express = require("express");
const { getRolesController } = require("./controller");

const router = express.Router();

router.get("/", (req, res) => {
  getRolesController(req, (result) => {
    res.json(result);
  });
});

module.exports = router;
