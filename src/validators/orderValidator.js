// src/validators/orderValidator.js

const Joi = require("joi");

// Schema for creating a new order
const createOrderSchema = Joi.object({
    table_id: Joi.number().integer().positive().required().messages({
        "number.base": "Table ID must be a number",
        "number.integer": "Table ID must be an integer",
        "number.positive": "Table ID must be positive",
        "any.required": "Table ID is required"
    }),
    items: Joi.array().items(
        Joi.object({
            item_id: Joi.number().integer().positive().required().messages({
                "number.base": "Item ID must be a number",
                "number.integer": "Item ID must be an integer",
                "number.positive": "Item ID must be positive",
                "any.required": "Item ID is required"
            }),
            quantity: Joi.number().integer().positive().required().messages({
                "number.base": "Quantity must be a number",
                "number.integer": "Quantity must be an integer",
                "number.positive": "Quantity must be positive",
                "any.required": "Quantity is required"
            }),
            special_instructions: Joi.string().allow('').optional().messages({
                "string.base": "Special instructions must be a string"
            })
        })
    ).min(1).required().messages({
        "array.min": "At least one item is required",
        "any.required": "Items are required"
    }),
    special_request: Joi.string().allow('').optional(),
    allergy_info: Joi.string().allow('').optional(),
    session_id: Joi.string().optional()
});

// Schema for updating order status
const validateOrderStatus = Joi.object({
    order_id: Joi.number().integer().positive().required().messages({
        "number.base": "Order ID must be a number",
        "number.integer": "Order ID must be an integer",
        "number.positive": "Order ID must be positive",
        "any.required": "Order ID is required"
    }),
    status_id: Joi.number().integer().positive().required().messages({
        "number.base": "Status ID must be a number",
        "number.integer": "Status ID must be an integer",
        "number.positive": "Status ID must be positive",
        "any.required": "Status ID is required"
    }),
    notes: Joi.string().allow('').optional()
});

// Schema for updating order item
const updateOrderItemSchema = Joi.object({
    order_item_id: Joi.number().integer().positive().required(),
    quantity: Joi.number().integer().positive().required(),
    special_instructions: Joi.string().allow('').optional()
});

// Schema for creating order invoice
const createInvoiceSchema = Joi.object({
    order_id: Joi.number().integer().positive().required(),
    discount_id: Joi.number().integer().positive().optional(),
    payment_method_id: Joi.number().integer().positive().required(),
    payment_status_id: Joi.number().integer().positive().required(),
    notes: Joi.string().allow('').optional()
});

module.exports = {
    createOrderSchema,
    validateOrderStatus,
    updateOrderItemSchema,
    createInvoiceSchema
};