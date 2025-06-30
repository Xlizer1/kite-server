const Joi = require("joi");

// Schema for creating complete recipe
const recipeCreationSchema = Joi.object({
    menu_item_id: Joi.number().integer().positive().required().messages({
        "number.base": "Menu item ID must be a number",
        "number.integer": "Menu item ID must be an integer",
        "number.positive": "Menu item ID must be positive",
        "any.required": "Menu item ID is required",
    }),
    ingredients: Joi.array()
        .items(
            Joi.object({
                inv_item_id: Joi.number().integer().positive().required().messages({
                    "number.base": "Inventory item ID must be a number",
                    "number.integer": "Inventory item ID must be an integer",
                    "number.positive": "Inventory item ID must be positive",
                    "any.required": "Inventory item ID is required",
                }),
                unit_id: Joi.number().integer().positive().required().messages({
                    "number.base": "Unit ID must be a number",
                    "number.integer": "Unit ID must be an integer",
                    "number.positive": "Unit ID must be positive",
                    "any.required": "Unit ID is required",
                }),
                quantity: Joi.number().positive().required().messages({
                    "number.base": "Quantity must be a number",
                    "number.positive": "Quantity must be positive",
                    "any.required": "Quantity is required",
                }),
            })
        )
        .min(1)
        .required()
        .messages({
            "array.base": "Ingredients must be an array",
            "array.min": "At least one ingredient is required",
            "any.required": "Ingredients are required",
        }),
});

// Schema for order validation
const orderValidationSchema = Joi.object({
    items: Joi.array()
        .items(
            Joi.object({
                menu_item_id: Joi.number().integer().positive().required().messages({
                    "number.base": "Menu item ID must be a number",
                    "number.integer": "Menu item ID must be an integer",
                    "number.positive": "Menu item ID must be positive",
                    "any.required": "Menu item ID is required",
                }),
                quantity: Joi.number().integer().positive().required().messages({
                    "number.base": "Quantity must be a number",
                    "number.integer": "Quantity must be an integer",
                    "number.positive": "Quantity must be positive",
                    "any.required": "Quantity is required",
                }),
            })
        )
        .min(1)
        .required()
        .messages({
            "array.base": "Items must be an array",
            "array.min": "At least one item is required",
            "any.required": "Items are required",
        }),
});

// Schema for menu item ID parameter
const menuItemIdParamSchema = Joi.object({
    menu_item_id: Joi.number().integer().positive().required().messages({
        "number.base": "Menu item ID must be a number",
        "number.integer": "Menu item ID must be an integer",
        "number.positive": "Menu item ID must be positive",
        "any.required": "Menu item ID is required",
    }),
    quantity: Joi.number().integer().positive().optional().messages({
        "number.base": "Quantity must be a number",
        "number.integer": "Quantity must be an integer",
        "number.positive": "Quantity must be positive",
    }),
});

// Schema for restaurant ID parameter
const restaurantIdParamSchema = Joi.object({
    restaurant_id: Joi.number().integer().positive().required().messages({
        "number.base": "Restaurant ID must be a number",
        "number.integer": "Restaurant ID must be an integer",
        "number.positive": "Restaurant ID must be positive",
        "any.required": "Restaurant ID is required",
    }),
});

// Schema for ingredient batch consumption tracking
const ingredientConsumptionSchema = Joi.object({
    order_id: Joi.number().integer().positive().required().messages({
        "number.base": "Order ID must be a number",
        "number.integer": "Order ID must be an integer",
        "number.positive": "Order ID must be positive",
        "any.required": "Order ID is required",
    }),
    ingredients: Joi.array()
        .items(
            Joi.object({
                inventory_id: Joi.number().integer().positive().required().messages({
                    "number.base": "Inventory ID must be a number",
                    "number.integer": "Inventory ID must be an integer",
                    "number.positive": "Inventory ID must be positive",
                    "any.required": "Inventory ID is required",
                }),
                quantity: Joi.number().positive().required().messages({
                    "number.base": "Quantity must be a number",
                    "number.positive": "Quantity must be positive",
                    "any.required": "Quantity is required",
                }),
            })
        )
        .min(1)
        .required()
        .messages({
            "array.base": "Ingredients must be an array",
            "array.min": "At least one ingredient is required",
            "any.required": "Ingredients are required",
        }),
});

// Schema for recipe validation query
const recipeValidationQuerySchema = Joi.object({
    menu_item_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
        "array.base": "Menu item IDs must be an array",
        "array.min": "At least one menu item ID is required",
        "any.required": "Menu item IDs are required",
    }),
    quantities: Joi.array().items(Joi.number().integer().positive()).optional().messages({
        "array.base": "Quantities must be an array",
    }),
})
    .custom((value, helpers) => {
        // If quantities provided, must match menu_item_ids length
        if (value.quantities && value.quantities.length !== value.menu_item_ids.length) {
            return helpers.error("custom.quantitiesLength");
        }
        return value;
    })
    .messages({
        "custom.quantitiesLength": "Quantities array length must match menu item IDs array length",
    });

// Constants for validation
const RECIPE_STATUSES = {
    AVAILABLE: "available",
    PARTIALLY_AVAILABLE: "partially_available",
    UNAVAILABLE: "unavailable",
};

const CONSUMPTION_TYPES = {
    ORDER: "order",
    MANUAL: "manual",
    SYSTEM: "system",
    WASTE: "waste",
};

module.exports = {
    recipeCreationSchema,
    orderValidationSchema,
    menuItemIdParamSchema,
    restaurantIdParamSchema,
    ingredientConsumptionSchema,
    recipeValidationQuerySchema,
    RECIPE_STATUSES,
    CONSUMPTION_TYPES,
};
