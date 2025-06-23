// src/validators/tableValidator.js - Comprehensive table validation schemas

const Joi = require("joi");

// Schema for creating a new table
const createTableSchema = Joi.object({
    restaurant_id: Joi.number().integer().positive().optional().messages({
        "number.base": "Restaurant ID must be a number",
        "number.integer": "Restaurant ID must be an integer",
        "number.positive": "Restaurant ID must be positive",
    }),
    number: Joi.number().integer().positive().required().messages({
        "number.base": "Table number must be a number",
        "number.integer": "Table number must be an integer",
        "number.positive": "Table number must be positive",
        "any.required": "Table number is required",
    }),
    name: Joi.string().min(2).max(50).optional().messages({
        "string.base": "Table name must be a string",
        "string.min": "Table name must be at least 2 characters long",
        "string.max": "Table name cannot exceed 50 characters",
    }),
    seats: Joi.number().integer().min(1).max(20).optional().messages({
        "number.base": "Seats must be a number",
        "number.integer": "Seats must be an integer",
        "number.min": "Seats must be at least 1",
        "number.max": "Seats cannot exceed 20",
    }),
});

// Schema for updating a table
const updateTableSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        "number.base": "Table ID must be a number",
        "number.integer": "Table ID must be an integer",
        "number.positive": "Table ID must be positive",
        "any.required": "Table ID is required",
    }),
    name: Joi.string().min(2).max(50).optional().messages({
        "string.base": "Table name must be a string",
        "string.min": "Table name must be at least 2 characters long",
        "string.max": "Table name cannot exceed 50 characters",
    }),
    number: Joi.number().integer().positive().optional().messages({
        "number.base": "Table number must be a number",
        "number.integer": "Table number must be an integer",
        "number.positive": "Table number must be positive",
    }),
    seats: Joi.number().integer().min(1).max(20).optional().messages({
        "number.base": "Seats must be a number",
        "number.integer": "Seats must be an integer",
        "number.min": "Seats must be at least 1",
        "number.max": "Seats cannot exceed 20",
    }),
    status: Joi.string().valid("available", "occupied", "reserved", "maintenance").optional().messages({
        "string.base": "Status must be a string",
        "any.only": "Status must be one of: available, occupied, reserved, maintenance",
    }),
});

// Schema for table ID parameter validation
const tableIdParamSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        "number.base": "Table ID must be a number",
        "number.integer": "Table ID must be an integer",
        "number.positive": "Table ID must be positive",
        "any.required": "Table ID is required",
    }),
});

// Schema for get tables query parameters
const getTablesQuerySchema = Joi.object({
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
    restaurant_id: Joi.number().integer().positive().optional().messages({
        "number.base": "Restaurant ID must be a number",
        "number.integer": "Restaurant ID must be an integer",
        "number.positive": "Restaurant ID must be positive",
    }),
    status: Joi.string().valid("available", "occupied", "reserved", "maintenance").optional().messages({
        "string.base": "Status must be a string",
        "any.only": "Status must be one of: available, occupied, reserved, maintenance",
    }),
    sort_by: Joi.string()
        .valid("id", "number", "name", "seats", "status", "created_at", "updated_at")
        .default("number")
        .messages({
            "string.base": "Sort by must be a string",
            "any.only": "Sort by must be one of: id, number, name, seats, status, created_at, updated_at",
        }),
    sort_order: Joi.string().valid("ASC", "DESC").default("ASC").messages({
        "string.base": "Sort order must be a string",
        "any.only": "Sort order must be either ASC or DESC",
    }),
});

// Schema for updating table status
const updateTableStatusSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        "number.base": "Table ID must be a number",
        "number.integer": "Table ID must be an integer",
        "number.positive": "Table ID must be positive",
        "any.required": "Table ID is required",
    }),
    status: Joi.string().valid("available", "occupied", "reserved", "maintenance").required().messages({
        "string.base": "Status must be a string",
        "any.only": "Status must be one of: available, occupied, reserved, maintenance",
        "any.required": "Status is required",
    }),
    customer_count: Joi.number().integer().min(0).max(20).optional().messages({
        "number.base": "Customer count must be a number",
        "number.integer": "Customer count must be an integer",
        "number.min": "Customer count cannot be negative",
        "number.max": "Customer count cannot exceed 20",
    }),
});

// Schema for regenerating QR code
const regenerateQRSchema = Joi.object({
    id: Joi.number().integer().positive().required().messages({
        "number.base": "Table ID must be a number",
        "number.integer": "Table ID must be an integer",
        "number.positive": "Table ID must be positive",
        "any.required": "Table ID is required",
    }),
});

// Schema for bulk operations on tables
const bulkUpdateTablesSchema = Joi.object({
    table_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
        "array.base": "Table IDs must be an array",
        "array.min": "At least one table ID is required",
        "any.required": "Table IDs are required",
    }),
    action: Joi.string().valid("activate", "deactivate", "set_maintenance", "set_available").required().messages({
        "string.base": "Action must be a string",
        "any.only": "Action must be one of: activate, deactivate, set_maintenance, set_available",
        "any.required": "Action is required",
    }),
});

// Schema for bulk deleting tables
const bulkDeleteTablesSchema = Joi.object({
    table_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
        "array.base": "Table IDs must be an array",
        "array.min": "At least one table ID is required",
        "any.required": "Table IDs are required",
    }),
});

// Schema for table statistics query
const getTableStatisticsSchema = Joi.object({
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

// Schema for exporting tables
const exportTablesSchema = Joi.object({
    format: Joi.string().valid("csv", "json", "xlsx").default("csv").messages({
        "string.base": "Format must be a string",
        "any.only": "Format must be one of: csv, json, xlsx",
    }),
    restaurant_id: Joi.number().integer().positive().optional().messages({
        "number.base": "Restaurant ID must be a number",
        "number.integer": "Restaurant ID must be an integer",
        "number.positive": "Restaurant ID must be positive",
    }),
    status: Joi.string().valid("available", "occupied", "reserved", "maintenance").optional().messages({
        "string.base": "Status must be a string",
        "any.only": "Status must be one of: available, occupied, reserved, maintenance",
    }),
    include_qr_codes: Joi.boolean().default(false).messages({
        "boolean.base": "Include QR codes must be a boolean",
    }),
});

// Schema for table booking/reservation
const createTableReservationSchema = Joi.object({
    table_id: Joi.number().integer().positive().required().messages({
        "number.base": "Table ID must be a number",
        "number.integer": "Table ID must be an integer",
        "number.positive": "Table ID must be positive",
        "any.required": "Table ID is required",
    }),
    customer_name: Joi.string().min(2).max(100).required().messages({
        "string.base": "Customer name must be a string",
        "string.min": "Customer name must be at least 2 characters long",
        "string.max": "Customer name cannot exceed 100 characters",
        "any.required": "Customer name is required",
    }),
    customer_phone: Joi.string()
        .pattern(/^00964(77|78|79|75)[0-9]{8}$/)
        .required()
        .messages({
            "string.base": "Customer phone must be a string",
            "string.pattern.base":
                "Phone number must be a valid Iraqi mobile number (00964 followed by 77/78/79/75 and 8 digits)",
            "any.required": "Customer phone is required",
        }),
    party_size: Joi.number().integer().min(1).max(20).required().messages({
        "number.base": "Party size must be a number",
        "number.integer": "Party size must be an integer",
        "number.min": "Party size must be at least 1",
        "number.max": "Party size cannot exceed 20",
        "any.required": "Party size is required",
    }),
    reservation_time: Joi.date().greater("now").required().messages({
        "date.base": "Reservation time must be a valid date",
        "date.greater": "Reservation time must be in the future",
        "any.required": "Reservation time is required",
    }),
    special_requests: Joi.string().max(500).optional().messages({
        "string.base": "Special requests must be a string",
        "string.max": "Special requests cannot exceed 500 characters",
    }),
});

// Schema for updating table reservation
const updateTableReservationSchema = Joi.object({
    reservation_id: Joi.number().integer().positive().required().messages({
        "number.base": "Reservation ID must be a number",
        "number.integer": "Reservation ID must be an integer",
        "number.positive": "Reservation ID must be positive",
        "any.required": "Reservation ID is required",
    }),
    status: Joi.string().valid("confirmed", "cancelled", "completed", "no_show").optional().messages({
        "string.base": "Status must be a string",
        "any.only": "Status must be one of: confirmed, cancelled, completed, no_show",
    }),
    party_size: Joi.number().integer().min(1).max(20).optional().messages({
        "number.base": "Party size must be a number",
        "number.integer": "Party size must be an integer",
        "number.min": "Party size must be at least 1",
        "number.max": "Party size cannot exceed 20",
    }),
    reservation_time: Joi.date().greater("now").optional().messages({
        "date.base": "Reservation time must be a valid date",
        "date.greater": "Reservation time must be in the future",
    }),
    special_requests: Joi.string().max(500).optional().messages({
        "string.base": "Special requests must be a string",
        "string.max": "Special requests cannot exceed 500 characters",
    }),
    notes: Joi.string().max(500).optional().messages({
        "string.base": "Notes must be a string",
        "string.max": "Notes cannot exceed 500 characters",
    }),
});

// Valid table statuses for reference
const TABLE_STATUSES = {
    AVAILABLE: "available",
    OCCUPIED: "occupied",
    RESERVED: "reserved",
    MAINTENANCE: "maintenance",
};

// Valid sort fields for reference
const SORT_FIELDS = {
    ID: "id",
    NUMBER: "number",
    NAME: "name",
    SEATS: "seats",
    STATUS: "status",
    CREATED_AT: "created_at",
    UPDATED_AT: "updated_at",
};

// Valid export formats for reference
const EXPORT_FORMATS = {
    CSV: "csv",
    JSON: "json",
    XLSX: "xlsx",
};

module.exports = {
    // Basic CRUD schemas
    createTableSchema,
    updateTableSchema,
    tableIdParamSchema,

    // Query and filtering schemas
    getTablesQuerySchema,
    getTableStatisticsSchema,

    // Status management schemas
    updateTableStatusSchema,
    regenerateQRSchema,

    // Bulk operations schemas
    bulkUpdateTablesSchema,
    bulkDeleteTablesSchema,

    // Export schema
    exportTablesSchema,

    // Reservation schemas
    createTableReservationSchema,
    updateTableReservationSchema,

    // Constants for reference
    TABLE_STATUSES,
    SORT_FIELDS,
    EXPORT_FORMATS,
};
