const Joi = require("joi");

// Schema for creating inventory batch
const inventoryBatchSchema = Joi.object({
    inventory_id: Joi.number().integer().positive().required().messages({
        "number.base": "Inventory ID must be a number",
        "number.integer": "Inventory ID must be an integer",
        "number.positive": "Inventory ID must be positive",
        "any.required": "Inventory ID is required",
    }),
    batch_number: Joi.string().min(1).max(50).required().messages({
        "string.base": "Batch number must be a string",
        "string.min": "Batch number cannot be empty",
        "string.max": "Batch number cannot exceed 50 characters",
        "any.required": "Batch number is required",
    }),
    initial_quantity: Joi.number().positive().required().messages({
        "number.base": "Initial quantity must be a number",
        "number.positive": "Initial quantity must be positive",
        "any.required": "Initial quantity is required",
    }),
    unit_id: Joi.number().integer().positive().required().messages({
        "number.base": "Unit ID must be a number",
        "number.integer": "Unit ID must be an integer",
        "number.positive": "Unit ID must be positive",
        "any.required": "Unit ID is required",
    }),
    purchase_price: Joi.number().min(0).optional().messages({
        "number.base": "Purchase price must be a number",
        "number.min": "Purchase price cannot be negative",
    }),
    selling_price: Joi.number().min(0).optional().messages({
        "number.base": "Selling price must be a number",
        "number.min": "Selling price cannot be negative",
    }),
    currency_id: Joi.number().integer().positive().optional().messages({
        "number.base": "Currency ID must be a number",
        "number.integer": "Currency ID must be an integer",
        "number.positive": "Currency ID must be positive",
    }),
    supplier_id: Joi.number().integer().positive().optional().messages({
        "number.base": "Supplier ID must be a number",
        "number.integer": "Supplier ID must be an integer",
        "number.positive": "Supplier ID must be positive",
    }),
    purchase_date: Joi.date().max("now").optional().messages({
        "date.base": "Purchase date must be a valid date",
        "date.max": "Purchase date cannot be in the future",
    }),
    expiry_date: Joi.date().greater("now").optional().messages({
        "date.base": "Expiry date must be a valid date",
        "date.greater": "Expiry date must be in the future",
    }),
    manufacturing_date: Joi.date().max("now").optional().messages({
        "date.base": "Manufacturing date must be a valid date",
        "date.max": "Manufacturing date cannot be in the future",
    }),
    lot_number: Joi.string().max(100).optional().messages({
        "string.base": "Lot number must be a string",
        "string.max": "Lot number cannot exceed 100 characters",
    }),
    notes: Joi.string().max(500).optional().messages({
        "string.base": "Notes must be a string",
        "string.max": "Notes cannot exceed 500 characters",
    }),
});

// Schema for updating inventory batch
const batchUpdateSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        "number.base": "Batch ID must be a number",
        "number.integer": "Batch ID must be an integer",
        "number.positive": "Batch ID must be positive",
        "any.required": "Batch ID is required",
    }),
    notes: Joi.string().max(500).optional().messages({
        "string.base": "Notes must be a string",
        "string.max": "Notes cannot exceed 500 characters",
    }),
    selling_price: Joi.number().min(0).optional().messages({
        "number.base": "Selling price must be a number",
        "number.min": "Selling price cannot be negative",
    }),
    status: Joi.string().valid("active", "expired", "consumed", "damaged").optional().messages({
        "string.base": "Status must be a string",
        "any.only": "Status must be one of: active, expired, consumed, damaged",
    }),
});

// Schema for batch consumption
const batchConsumptionSchema = Joi.object({
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
    reference_type: Joi.string().valid("order", "manual", "system").optional().messages({
        "string.base": "Reference type must be a string",
        "any.only": "Reference type must be one of: order, manual, system",
    }),
    reference_id: Joi.number().integer().positive().optional().messages({
        "number.base": "Reference ID must be a number",
        "number.integer": "Reference ID must be an integer",
        "number.positive": "Reference ID must be positive",
    }),
    notes: Joi.string().max(500).optional().messages({
        "string.base": "Notes must be a string",
        "string.max": "Notes cannot exceed 500 characters",
    }),
});

// Schema for batch ID parameter
const batchIdParamSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        "number.base": "Batch ID must be a number",
        "number.integer": "Batch ID must be an integer",
        "number.positive": "Batch ID must be positive",
        "any.required": "Batch ID is required",
    }),
});

// Schema for inventory ID parameter
const inventoryIdParamSchema = Joi.object({
    inventory_id: Joi.number().integer().positive().required().messages({
        "number.base": "Inventory ID must be a number",
        "number.integer": "Inventory ID must be an integer",
        "number.positive": "Inventory ID must be positive",
        "any.required": "Inventory ID is required",
    }),
});

// Schema for expiring batches query
const getExpiringBatchesSchema = Joi.object({
    days_ahead: Joi.number().integer().min(1).max(365).default(7).messages({
        "number.base": "Days ahead must be a number",
        "number.integer": "Days ahead must be an integer",
        "number.min": "Days ahead must be at least 1",
        "number.max": "Days ahead cannot exceed 365",
    }),
    restaurant_id: Joi.number().integer().positive().optional().messages({
        "number.base": "Restaurant ID must be a number",
        "number.integer": "Restaurant ID must be an integer",
        "number.positive": "Restaurant ID must be positive",
    }),
});

// Schema for batch query parameters
const getBatchesQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
        "number.base": "Page must be a number",
        "number.integer": "Page must be an integer",
        "number.min": "Page must be at least 1",
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
        "number.base": "Limit must be a number",
        "number.integer": "Limit must be an integer",
        "number.min": "Limit must be at least 1",
        "number.max": "Limit cannot exceed 100",
    }),
    search: Joi.string().trim().max(100).optional().messages({
        "string.base": "Search term must be a string",
        "string.max": "Search term cannot exceed 100 characters",
    }),
    inventory_id: Joi.number().integer().positive().optional().messages({
        "number.base": "Inventory ID must be a number",
        "number.integer": "Inventory ID must be an integer",
        "number.positive": "Inventory ID must be positive",
    }),
    status: Joi.string().valid("active", "expired", "consumed", "damaged").optional().messages({
        "string.base": "Status must be a string",
        "any.only": "Status must be one of: active, expired, consumed, damaged",
    }),
    expired_only: Joi.boolean().default(false).messages({
        "boolean.base": "Expired only must be a boolean",
    }),
    expiring_soon: Joi.boolean().default(false).messages({
        "boolean.base": "Expiring soon must be a boolean",
    }),
    sort_by: Joi.string()
        .valid(
            "id",
            "batch_number",
            "initial_quantity",
            "current_quantity",
            "purchase_date",
            "expiry_date",
            "created_at"
        )
        .default("created_at")
        .messages({
            "string.base": "Sort by must be a string",
            "any.only":
                "Sort by must be one of: id, batch_number, initial_quantity, current_quantity, purchase_date, expiry_date, created_at",
        }),
    sort_order: Joi.string().valid("ASC", "DESC").default("DESC").messages({
        "string.base": "Sort order must be a string",
        "any.only": "Sort order must be either ASC or DESC",
    }),
});

// Constants for validation
const BATCH_STATUSES = ["active", "expired", "consumed", "damaged"];
const MOVEMENT_TYPES = ["consumption", "adjustment", "damage", "return"];
const REFERENCE_TYPES = ["order", "manual", "system"];

module.exports = {
    inventoryBatchSchema,
    batchUpdateSchema,
    batchConsumptionSchema,
    batchIdParamSchema,
    inventoryIdParamSchema,
    getExpiringBatchesSchema,
    getBatchesQuerySchema,
    BATCH_STATUSES,
    MOVEMENT_TYPES,
    REFERENCE_TYPES,
};
