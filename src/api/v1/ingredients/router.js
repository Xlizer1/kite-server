const express = require("express");
const router = express.Router();
const {
    getIngredientsController,
    getIngredientsByRestaurantIDController,
    createIngredientController,
    getRecipeWithAvailabilityController,
    validateMenuItemAvailabilityController,
    getRestaurantRecipesWithAvailabilityController,
    validateMultipleMenuItemsController,
    createCompleteRecipeController,
} = require("./controller");
const validateRequest = require("../../../middleware/validateRequest");
const { ingredientSchema } = require("../../../validators/ingredientSchema");
const { authenticateToken } = require("../../../middleware/auth");

const {
    recipeCreationSchema,
    orderValidationSchema,
    menuItemIdParamSchema,
} = require("../../../validators/recipeSchema");

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

// Get recipe with stock availability for a menu item
router.get("/recipe/:menu_item_id/availability", validateRequest(menuItemIdParamSchema), (req, res) => {
    getRecipeWithAvailabilityController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Validate if a menu item can be prepared
router.get("/validate/:menu_item_id", validateRequest(menuItemIdParamSchema), (req, res) => {
    validateMenuItemAvailabilityController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Get all restaurant recipes with availability status
router.get("/restaurant/:restaurant_id/availability", (req, res) => {
    getRestaurantRecipesWithAvailabilityController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Validate multiple menu items for order processing
router.post("/validate-order", validateRequest(orderValidationSchema), (req, res) => {
    validateMultipleMenuItemsController(req, (result) => {
        res.status(result.statusCode || 200).json(result);
    });
});

// Create complete recipe for a menu item
router.post("/recipe", validateRequest(recipeCreationSchema), (req, res) => {
    createCompleteRecipeController(req, (result) => {
        res.status(result.statusCode || 201).json(result);
    });
});
module.exports = router;
