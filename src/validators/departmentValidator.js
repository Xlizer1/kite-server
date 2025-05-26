// src/validators/departmentValidator.js

const Joi = require("joi");

// Schema for creating a new department
const createDepartmentSchema = Joi.object({
    name: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required()
        .messages({
            'string.base': 'Department name must be a string',
            'string.empty': 'Department name cannot be empty',
            'string.min': 'Department name must be at least 2 characters long',
            'string.max': 'Department name cannot exceed 50 characters',
            'any.required': 'Department name is required'
        })
});

// Schema for updating a department
const updateDepartmentSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Department ID must be a number',
            'number.integer': 'Department ID must be an integer',
            'number.positive': 'Department ID must be positive',
            'any.required': 'Department ID is required'
        }),
    name: Joi.string()
        .min(2)
        .max(50)
        .trim()
        .required()
        .messages({
            'string.base': 'Department name must be a string',
            'string.empty': 'Department name cannot be empty',
            'string.min': 'Department name must be at least 2 characters long',
            'string.max': 'Department name cannot exceed 50 characters',
            'any.required': 'Department name is required'
        })
});

// Schema for department ID parameter validation
const departmentIdParamSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Department ID must be a number',
            'number.integer': 'Department ID must be an integer',
            'number.positive': 'Department ID must be positive',
            'any.required': 'Department ID is required'
        })
});

// Schema for getting department users with query parameters
const getDepartmentUsersSchema = Joi.object({
    id: Joi.number()
        .integer()
        .positive()
        .required()
        .messages({
            'number.base': 'Department ID must be a number',
            'number.integer': 'Department ID must be an integer',
            'number.positive': 'Department ID must be positive',
            'any.required': 'Department ID is required'
        }),
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.base': 'Page must be a number',
            'number.integer': 'Page must be an integer',
            'number.min': 'Page must be at least 1'
        }),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(10)
        .messages({
            'number.base': 'Limit must be a number',
            'number.integer': 'Limit must be an integer',
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit cannot exceed 100'
        }),
    status: Joi.string()
        .valid('enabled', 'disabled')
        .optional()
        .messages({
            'string.base': 'Status must be a string',
            'any.only': 'Status must be either "enabled" or "disabled"'
        })
});

// Schema for getting departments with query parameters
const getDepartmentsSchema = Joi.object({
    page: Joi.number()
        .integer()
        .min(1)
        .default(1)
        .messages({
            'number.base': 'Page must be a number',
            'number.integer': 'Page must be an integer',
            'number.min': 'Page must be at least 1'
        }),
    limit: Joi.number()
        .integer()
        .min(1)
        .max(100)
        .default(50)
        .messages({
            'number.base': 'Limit must be a number',
            'number.integer': 'Limit must be an integer',
            'number.min': 'Limit must be at least 1',
            'number.max': 'Limit cannot exceed 100'
        }),
    search: Joi.string()
        .trim()
        .optional()
        .messages({
            'string.base': 'Search term must be a string'
        }),
    sort_by: Joi.string()
        .valid('id', 'name', 'user_count')
        .default('id')
        .messages({
            'string.base': 'Sort by must be a string',
            'any.only': 'Sort by must be one of: id, name, user_count'
        }),
    sort_order: Joi.string()
        .valid('ASC', 'DESC')
        .default('ASC')
        .messages({
            'string.base': 'Sort order must be a string',
            'any.only': 'Sort order must be either ASC or DESC'
        }),
    include_user_count: Joi.boolean()
        .default(false)
        .messages({
            'boolean.base': 'Include user count must be a boolean'
        })
});

module.exports = {
    createDepartmentSchema,
    updateDepartmentSchema,
    departmentIdParamSchema,
    getDepartmentUsersSchema,
    getDepartmentsSchema
};