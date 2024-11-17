const { registerUserController } = require("./controller");

const express = require("express");

const router = express.Router();

router.post("/register", (request, response) => {
  registerUserController(request, (result) => {
    response.json(result);
  });
});

module.exports = router;
