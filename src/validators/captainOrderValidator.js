// src/validators/captainOrderValidator.js

const Joi = require("joi");

// Schema for captain creating orders directly for tables
const createOrderForTableSchema = Joi.object({
    table_id: Joi.number().integer().positive().required().messages({
        "number.base": "Table ID must be a number",
        "number.integer": "Table ID must be an integer",
        "number.positive": "Table ID must be positive",
        "any.required": "Table ID is required",
    }),
    items: Joi.array()
        .items(
            Joi.object({
                item_id: Joi.number().integer().positive().required().messages({
                    "number.base": "Item ID must be a number",
                    "number.integer": "Item ID must be an integer",
                    "number.positive": "Item ID must be positive",
                    "any.required": "Item ID is required",
                }),
                quantity: Joi.number().integer().positive().required().messages({
                    "number.base": "Quantity must be a number",
                    "number.integer": "Quantity must be an integer",
                    "number.positive": "Quantity must be positive",
                    "any.required": "Quantity is required",
                }),
                special_instructions: Joi.string().allow("").optional().messages({
                    "string.base": "Special instructions must be a string",
                }),
            })
        )
        .min(1)
        .required()
        .messages({
            "array.min": "At least one item is required",
            "any.required": "Items are required",
        }),
    special_request: Joi.string().allow("").optional().messages({
        "string.base": "Special request must be a string",
    }),
    allergy_info: Joi.string().allow("").optional().messages({
        "string.base": "Allergy info must be a string",
    }),
    customer_name: Joi.string().allow("").optional().messages({
        "string.base": "Customer name must be a string",
    }),
});

module.exports = {
    createOrderForTableSchema,
};
