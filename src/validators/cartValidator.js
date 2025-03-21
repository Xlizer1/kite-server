const Joi = require("joi");

// Schema for initializing cart
const cartSchema = Joi.object({
    key: Joi.string().required().messages({
        "string.base": "Encrypted key must be a string",
        "any.required": "Encrypted key is required",
    }),
    latitude: Joi.number().optional().messages({
        "number.base": "Latitude must be a number",
    }),
    longitude: Joi.number().optional().messages({
        "number.base": "Longitude must be a number",
    }),
});

// Schema for cart items
const cartItemSchema = Joi.object({
    itemId: Joi.number().integer().optional().messages({
        "number.base": "Item ID must be a number",
        "number.integer": "Item ID must be an integer",
    }),
    quantity: Joi.number().integer().min(1).default(1).messages({
        "number.base": "Quantity must be a number",
        "number.integer": "Quantity must be an integer",
        "number.min": "Quantity must be at least 1",
    }),
    specialInstructions: Joi.string().allow("", null).optional().messages({
        "string.base": "Special instructions must be a string",
    }),
    cartItemId: Joi.string().allow("", null).optional(),
    // key: Joi.string().required(),
});

// Schema for updating captain call status
const captainCallSchema = Joi.object({
    status: Joi.string().valid("in_progress", "completed", "cancelled").required().messages({
        "string.base": "Status must be a string",
        "any.only": "Status must be one of: in_progress, completed, cancelled",
        "any.required": "Status is required",
    }),
});

// Schema for creating order from cart
const createOrderSchema = Joi.object({
    cartId: Joi.number().integer().required().messages({
        "number.base": "Cart ID must be a number",
        "number.integer": "Cart ID must be an integer",
        "any.required": "Cart ID is required",
    }),
});

module.exports = {
    cartSchema,
    cartItemSchema,
    captainCallSchema,
    createOrderSchema,
};
