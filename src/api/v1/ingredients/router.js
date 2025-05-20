const express = require("express");
const router = express.Router();
const {
    getIngredientsController,
    getIngredientsByRestaurantIDController,
    createIngredientController,
} = require("./controller");
const validateRequest = require("../../../middleware/validateRequest");
const { ingredientSchema } = require("../../../validators/ingredientSchema");
const { authenticateToken } = require("../../../middleware/auth");

// All routes require authentication
router.use(authenticateToken);

// Get all ingredients
router.get("/", (req, res) => {
    getIngredientsController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Get ingredients by restaurant ID
router.get("/:restaurant_id", (req, res) => {
    getIngredientsByRestaurantIDController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Create new ingredient
router.post("/", validateRequest(ingredientSchema), (req, res) => {
    createIngredientController(req, (result) => {
        res.status(result.statusCode || 201).json(result);
    });
});

module.exports = router;
