const Joi = require("joi");

// Schema for creating a new category
const categoryCreateSchema = Joi.object({
    name: Joi.string().min(2).max(100).trim().required().messages({
        "string.base": "Category name must be a string",
        "string.empty": "Category name cannot be empty",
        "string.min": "Category name must be at least 2 characters long",
        "string.max": "Category name cannot exceed 100 characters",
        "any.required": "Category name is required",
    }),
    restaurant_id: Joi.number().integer().positive().optional().messages({
        "number.base": "Restaurant ID must be a number",
        "number.integer": "Restaurant ID must be an integer",
        "number.positive": "Restaurant ID must be positive",
    }),
    image: Joi.object({
        fieldname: Joi.string(),
        originalname: Joi.string(),
        encoding: Joi.string(),
        mimetype: Joi.string().valid("image/jpeg", "image/png", "image/webp", "image/avif").messages({
            "any.only": "Image must be a valid image file (JPEG, PNG, WebP, or AVIF)",
        }),
        destination: Joi.string(),
        filename: Joi.string(),
        path: Joi.string(),
        size: Joi.number()
            .max(10 * 1024 * 1024)
            .messages({
                "number.max": "Image file size cannot exceed 10MB",
            }),
    }).optional(),
});

// Schema for updating a category
const categoryUpdateSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        "number.base": "Category ID must be a number",
        "number.integer": "Category ID must be an integer",
        "number.positive": "Category ID must be positive",
        "any.required": "Category ID is required",
    }),
    name: Joi.string().min(2).max(100).trim().required().messages({
        "string.base": "Category name must be a string",
        "string.empty": "Category name cannot be empty",
        "string.min": "Category name must be at least 2 characters long",
        "string.max": "Category name cannot exceed 100 characters",
        "any.required": "Category name is required",
    }),
});

// Schema for category ID parameter validation
const categoryIdParamSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        "number.base": "Category ID must be a number",
        "number.integer": "Category ID must be an integer",
        "number.positive": "Category ID must be positive",
        "any.required": "Category ID is required",
    }),
});

// Schema for updating category image
const categoryImageUpdateSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        "number.base": "Category ID must be a number",
        "number.integer": "Category ID must be an integer",
        "number.positive": "Category ID must be positive",
        "any.required": "Category ID is required",
    }),
    image: Joi.object({
        fieldname: Joi.string(),
        originalname: Joi.string(),
        encoding: Joi.string(),
        mimetype: Joi.string().valid("image/jpeg", "image/png", "image/webp", "image/avif").required().messages({
            "any.only": "Image must be a valid image file (JPEG, PNG, WebP, or AVIF)",
            "any.required": "Image file is required",
        }),
        destination: Joi.string(),
        filename: Joi.string(),
        path: Joi.string(),
        size: Joi.number()
            .max(10 * 1024 * 1024)
            .messages({
                "number.max": "Image file size cannot exceed 10MB",
            }),
    })
        .required()
        .messages({
            "any.required": "Image file is required",
        }),
});

// Schema for getting categories with query parameters
const getCategoriesQuerySchema = Joi.object({
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
    search: Joi.string().trim().min(0).max(100).optional().messages({
        "string.base": "Search term must be a string",
        "string.max": "Search term cannot exceed 100 characters",
    }),
    restaurant_id: Joi.number().integer().positive().optional().messages({
        "number.base": "Restaurant ID must be a number",
        "number.integer": "Restaurant ID must be an integer",
        "number.positive": "Restaurant ID must be positive",
    }),
    sort_by: Joi.string().valid("id", "name", "created_at", "updated_at", "item_count").default("created_at").messages({
        "string.base": "Sort by must be a string",
        "any.only": "Sort by must be one of: id, name, created_at, updated_at, item_count",
    }),
    sort_order: Joi.string().valid("ASC", "DESC").default("DESC").messages({
        "string.base": "Sort order must be a string",
        "any.only": "Sort order must be either ASC or DESC",
    }),
    include_item_count: Joi.boolean().default(false).messages({
        "boolean.base": "Include item count must be a boolean",
    }),
});

// Schema for bulk deleting categories
const bulkDeleteCategoriesSchema = Joi.object({
    category_ids: Joi.array().items(Joi.number().integer().positive()).min(1).max(50).required().messages({
        "array.base": "Category IDs must be an array",
        "array.min": "At least one category ID is required",
        "array.max": "Cannot delete more than 50 categories at once",
        "any.required": "Category IDs are required",
    }),
});

// Schema for exporting categories
const exportCategoriesSchema = Joi.object({
    format: Joi.string().valid("csv", "json", "xlsx").default("csv").messages({
        "string.base": "Format must be a string",
        "any.only": "Format must be one of: csv, json, xlsx",
    }),
    restaurant_id: Joi.number().integer().positive().optional().messages({
        "number.base": "Restaurant ID must be a number",
        "number.integer": "Restaurant ID must be an integer",
        "number.positive": "Restaurant ID must be positive",
    }),
    include_items: Joi.boolean().default(false).messages({
        "boolean.base": "Include items must be a boolean",
    }),
    date_from: Joi.date().optional().messages({
        "date.base": "Date from must be a valid date",
    }),
    date_to: Joi.date().greater(Joi.ref("date_from")).optional().messages({
        "date.base": "Date to must be a valid date",
        "date.greater": "Date to must be after date from",
    }),
});

// Schema for category statistics query
const getCategoryStatisticsSchema = Joi.object({
    restaurant_id: Joi.number().integer().positive().optional().messages({
        "number.base": "Restaurant ID must be a number",
        "number.integer": "Restaurant ID must be an integer",
        "number.positive": "Restaurant ID must be positive",
    }),
    date_from: Joi.date().optional().messages({
        "date.base": "Date from must be a valid date",
    }),
    date_to: Joi.date().greater(Joi.ref("date_from")).optional().messages({
        "date.base": "Date to must be a valid date",
        "date.greater": "Date to must be after date from",
    }),
});

// Schema for getting categories for selection/dropdown
const getCategoriesSelectionSchema = Joi.object({
    restaurant_id: Joi.number().integer().positive().optional().messages({
        "number.base": "Restaurant ID must be a number",
        "number.integer": "Restaurant ID must be an integer",
        "number.positive": "Restaurant ID must be positive",
    }),
    active_only: Joi.boolean().default(true).messages({
        "boolean.base": "Active only must be a boolean",
    }),
});

// Schema for category assignment operations
const assignCategoryToItemsSchema = Joi.object({
    category_id: Joi.number().integer().positive().required().messages({
        "number.base": "Category ID must be a number",
        "number.integer": "Category ID must be an integer",
        "number.positive": "Category ID must be positive",
        "any.required": "Category ID is required",
    }),
    item_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
        "array.base": "Item IDs must be an array",
        "array.min": "At least one item ID is required",
        "any.required": "Item IDs are required",
    }),
});

// Common constants for validation
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
const SORT_FIELDS = ["id", "name", "created_at", "updated_at", "item_count"];
const EXPORT_FORMATS = ["csv", "json", "xlsx"];

module.exports = {
    // Main CRUD schemas
    categoryCreateSchema,
    categoryUpdateSchema,
    categoryIdParamSchema,
    categoryImageUpdateSchema,

    // Query and filtering schemas
    getCategoriesQuerySchema,
    getCategoryStatisticsSchema,
    getCategoriesSelectionSchema,

    // Bulk operations schemas
    bulkDeleteCategoriesSchema,
    assignCategoryToItemsSchema,

    // Export schema
    exportCategoriesSchema,

    // Constants for reference
    ALLOWED_IMAGE_TYPES,
    MAX_IMAGE_SIZE,
    SORT_FIELDS,
    EXPORT_FORMATS,
};
