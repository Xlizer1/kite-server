const express = require("express");
const { getRestaurantsController, createRestaurantsController, updateRestaurantsController, deleteRestaurantsController } = require("./controller");

const router = express.Router();

router.get("/", (req, res) => {
  getRestaurantsController(req, (result) => {
    res.json(result);
  });
});

router.post("/", (req, res) => {
  createRestaurantsController(req, (result) => {
    res.json(result);
  });
});

router.put("/:id", (req, res) => {
  updateRestaurantsController(req, (result) => {
    res.json(result);
  });
});

router.delete("/:id", (req, res) => {
  deleteRestaurantsController(req, (result) => {
    res.json(result);
  });
});

module.exports = router;
