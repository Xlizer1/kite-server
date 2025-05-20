// src/validators/kitchenValidator.js

const Joi = require("joi");

// Schema for starting to process an order
const startProcessingOrderSchema = Joi.object({
    order_id: Joi.number().integer().positive().required().messages({
        "number.base": "Order ID must be a number",
        "number.integer": "Order ID must be an integer",
        "number.positive": "Order ID must be positive",
        "any.required": "Order ID is required"
    }),
    estimated_minutes: Joi.number().integer().min(1).max(120).optional().messages({
        "number.base": "Estimated minutes must be a number",
        "number.integer": "Estimated minutes must be an integer",
        "number.min": "Estimated minutes must be at least 1",
        "number.max": "Estimated minutes cannot exceed 120"
    })
});

// Schema for completing an order
const completeOrderSchema = Joi.object({
    order_id: Joi.number().integer().positive().required().messages({
        "number.base": "Order ID must be a number",
        "number.integer": "Order ID must be an integer",
        "number.positive": "Order ID must be positive",
        "any.required": "Order ID is required"
    }),
    notes: Joi.string().max(500).allow('').optional().messages({
        "string.base": "Notes must be a string",
        "string.max": "Notes cannot exceed 500 characters"
    })
});

// Schema for acknowledging low inventory
const acknowledgeInventoryAlertSchema = Joi.object({
    alert_id: Joi.number().integer().positive().required().messages({
        "number.base": "Alert ID must be a number",
        "number.integer": "Alert ID must be an integer",
        "number.positive": "Alert ID must be positive",
        "any.required": "Alert ID is required"
    })
});

// Schema for updating inventory quantity
const updateInventoryQuantitySchema = Joi.object({
    inventory_id: Joi.number().integer().positive().required().messages({
        "number.base": "Inventory ID must be a number",
        "number.integer": "Inventory ID must be an integer",
        "number.positive": "Inventory ID must be positive",
        "any.required": "Inventory ID is required"
    }),
    quantity: Joi.number().min(0).required().messages({
        "number.base": "Quantity must be a number",
        "number.min": "Quantity cannot be negative",
        "any.required": "Quantity is required"
    }),
    reason: Joi.string().required().messages({
        "string.base": "Reason must be a string",
        "any.required": "Reason is required"
    }),
    notes: Joi.string().max(500).allow('').optional().messages({
        "string.base": "Notes must be a string",
        "string.max": "Notes cannot exceed 500 characters"
    })
});

module.exports = {
    startProcessingOrderSchema,
    completeOrderSchema,
    acknowledgeInventoryAlertSchema,
    updateInventoryQuantitySchema
};