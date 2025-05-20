// src/validators/cashierValidator.js

const Joi = require("joi");

// Schema for creating a new invoice
const createInvoiceSchema = Joi.object({
    order_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
        "array.base": "Order IDs must be an array",
        "array.min": "At least one order ID is required",
        "any.required": "Order IDs are required"
    }),
    discount_id: Joi.number().integer().positive().allow(null).optional().messages({
        "number.base": "Discount ID must be a number",
        "number.integer": "Discount ID must be an integer",
        "number.positive": "Discount ID must be positive"
    }),
    payment_method_id: Joi.number().integer().positive().required().messages({
        "number.base": "Payment method ID must be a number",
        "number.integer": "Payment method ID must be an integer",
        "number.positive": "Payment method ID must be positive",
        "any.required": "Payment method ID is required"
    }),
    payment_status_id: Joi.number().integer().positive().required().messages({
        "number.base": "Payment status ID must be a number",
        "number.integer": "Payment status ID must be an integer",
        "number.positive": "Payment status ID must be positive",
        "any.required": "Payment status ID is required"
    }),
    notes: Joi.string().max(500).allow('').optional().messages({
        "string.base": "Notes must be a string",
        "string.max": "Notes cannot exceed 500 characters"
    })
});

// Schema for generating a receipt
const generateReceiptSchema = Joi.object({
    invoice_id: Joi.number().integer().positive().required().messages({
        "number.base": "Invoice ID must be a number",
        "number.integer": "Invoice ID must be an integer",
        "number.positive": "Invoice ID must be positive",
        "any.required": "Invoice ID is required"
    })
});

// Schema for creating a discount
const createDiscountSchema = Joi.object({
    restaurant_id: Joi.number().integer().positive().required().messages({
        "number.base": "Restaurant ID must be a number",
        "number.integer": "Restaurant ID must be an integer",
        "number.positive": "Restaurant ID must be positive",
        "any.required": "Restaurant ID is required"
    }),
    name: Joi.string().max(255).required().messages({
        "string.base": "Name must be a string",
        "string.max": "Name cannot exceed 255 characters",
        "any.required": "Name is required"
    }),
    description: Joi.string().max(500).allow('').optional().messages({
        "string.base": "Description must be a string",
        "string.max": "Description cannot exceed 500 characters"
    }),
    discount_type: Joi.string().valid('percentage', 'fixed').required().messages({
        "string.base": "Discount type must be a string",
        "any.only": "Discount type must be either 'percentage' or 'fixed'",
        "any.required": "Discount type is required"
    }),
    discount_value: Joi.number().positive().required().messages({
        "number.base": "Discount value must be a number",
        "number.positive": "Discount value must be positive",
        "any.required": "Discount value is required"
    }),
    applies_to: Joi.string().valid('order', 'menu_item', 'category').required().messages({
        "string.base": "Applies to must be a string",
        "any.only": "Applies to must be one of: 'order', 'menu_item', 'category'",
        "any.required": "Applies to is required"
    }),
    target_id: Joi.when('applies_to', {
        is: Joi.valid('menu_item', 'category'),
        then: Joi.number().integer().positive().required().messages({
            "number.base": "Target ID must be a number",
            "number.integer": "Target ID must be an integer",
            "number.positive": "Target ID must be positive",
            "any.required": "Target ID is required for menu_item and category discounts"
        }),
        otherwise: Joi.allow(null).optional()
    }),
    min_order_value: Joi.number().min(0).allow(null).optional().messages({
        "number.base": "Minimum order value must be a number",
        "number.min": "Minimum order value cannot be negative"
    }),
    active: Joi.boolean().default(true).messages({
        "boolean.base": "Active must be a boolean"
    }),
    starts_at: Joi.date().allow(null).optional().messages({
        "date.base": "Start date must be a valid date"
    }),
    ends_at: Joi.date().greater(Joi.ref('starts_at')).allow(null).optional().messages({
        "date.base": "End date must be a valid date",
        "date.greater": "End date must be after start date"
    })
});

module.exports = {
    createInvoiceSchema,
    generateReceiptSchema,
    createDiscountSchema
};