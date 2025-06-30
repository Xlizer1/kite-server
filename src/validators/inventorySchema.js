const Joi = require("joi");

const inventorySchema = Joi.object({
    restaurant_id: Joi.number().required(),
    name: Joi.string().required(),
    quantity: Joi.number().min(0).required(),
    unit_id: Joi.number().required(),
    threshold: Joi.number().min(0),
    price: Joi.number().min(0).required(),
    currency_id: Joi.number().required(),
});

const getInventoryWithBatchesQuerySchema = Joi.object({
    restaurant_id: Joi.number().integer().positive().optional().messages({
        "number.base": "Restaurant ID must be a number",
        "number.integer": "Restaurant ID must be an integer",
        "number.positive": "Restaurant ID must be positive",
    }),
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
    status_filter: Joi.string().valid("all", "low_stock", "out_of_stock", "in_stock").default("all").messages({
        "string.base": "Status filter must be a string",
        "any.only": "Status filter must be one of: all, low_stock, out_of_stock, in_stock",
    }),
    sort_by: Joi.string()
        .valid("id", "name", "total_quantity", "available_quantity", "created_at", "updated_at")
        .default("name")
        .messages({
            "string.base": "Sort by must be a string",
            "any.only": "Sort by must be one of: id, name, total_quantity, available_quantity, created_at, updated_at",
        }),
    sort_order: Joi.string().valid("ASC", "DESC").default("ASC").messages({
        "string.base": "Sort order must be a string",
        "any.only": "Sort order must be either ASC or DESC",
    }),
});

module.exports = {
    inventorySchema,
    getInventoryWithBatchesQuerySchema,
};
