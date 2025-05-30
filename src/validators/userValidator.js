const Joi = require("joi");

// Existing schemas (keep these)
const registerUserSchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email(),
  password: Joi.string().min(6).required(),
  newPassword: Joi.string().min(6),
  phone: Joi.string()
    .pattern(/^00964(77|78|79|75)[0-9]{8}$/)
    .required(),
  department_id: Joi.number().integer().positive().required(),
  restaurant_id: Joi.number().integer().positive().required(),
  enabled: Joi.number().integer().positive(),
  roles: Joi.array().required(),
});

const loginUserSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(3).required(),
});

// New validation schemas
const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().min(3).required().messages({
    'string.min': 'Current password must be at least 6 characters long',
    'any.required': 'Current password is required'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters long',
    'any.required': 'New password is required'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Password confirmation does not match new password',
    'any.required': 'Password confirmation is required'
  })
});

const profileUpdateSchema = Joi.object({
  name: Joi.string().min(3).max(50).required().messages({
    'string.min': 'Name must be at least 3 characters long',
    'string.max': 'Name cannot exceed 50 characters',
    'any.required': 'Name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  phone: Joi.string()
    .pattern(/^00964(77|78|79|75)[0-9]{8}$/)
    .required()
    .messages({
      'string.pattern.base': 'Phone number must be a valid Iraqi mobile number (00964 followed by 77/78/79/75 and 8 digits)',
      'any.required': 'Phone number is required'
    })
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  })
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Reset token is required'
  }),
  newPassword: Joi.string().min(6).required().messages({
    'string.min': 'New password must be at least 6 characters long',
    'any.required': 'New password is required'
  }),
  confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required().messages({
    'any.only': 'Password confirmation does not match new password',
    'any.required': 'Password confirmation is required'
  })
});

const userStatusUpdateSchema = Joi.object({
  status: Joi.number().integer().valid(0, 1).required().messages({
    'number.base': 'Status must be a number',
    'any.only': 'Status must be either 0 (disabled) or 1 (enabled)',
    'any.required': 'Status is required'
  })
});

const bulkDeleteUsersSchema = Joi.object({
  user_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    'array.base': 'User IDs must be an array',
    'array.min': 'At least one user ID is required',
    'any.required': 'User IDs are required'
  })
});

const bulkUpdateUserRolesSchema = Joi.object({
  user_ids: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    'array.base': 'User IDs must be an array',
    'array.min': 'At least one user ID is required',
    'any.required': 'User IDs are required'
  }),
  roles: Joi.array().items(Joi.number().integer().positive()).min(1).required().messages({
    'array.base': 'Roles must be an array',
    'array.min': 'At least one role is required',
    'any.required': 'Roles are required'
  })
});

const exportUsersSchema = Joi.object({
  format: Joi.string().valid('csv', 'json', 'xlsx').default('csv').messages({
    'any.only': 'Format must be one of: csv, json, xlsx'
  }),
  filters: Joi.object({
    department_id: Joi.number().integer().positive().optional(),
    restaurant_id: Joi.number().integer().positive().optional(),
    status: Joi.string().valid('enabled', 'disabled').optional(),
    date_from: Joi.date().optional(),
    date_to: Joi.date().greater(Joi.ref('date_from')).optional()
  }).optional()
});

const getUserActivitySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit cannot exceed 100'
  }),
  action: Joi.string().optional().messages({
    'string.base': 'Action must be a string'
  }),
  date_from: Joi.date().optional(),
  date_to: Joi.date().greater(Joi.ref('date_from')).optional()
});

const userIdParamSchema = Joi.object({
  id: Joi.number().integer().positive().required().messages({
    'number.base': 'User ID must be a number',
    'number.integer': 'User ID must be an integer',
    'number.positive': 'User ID must be positive',
    'any.required': 'User ID is required'
  })
});

module.exports = {
  // Existing schemas
  registerUserSchema,
  loginUserSchema,
  
  // New schemas
  changePasswordSchema,
  profileUpdateSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  userStatusUpdateSchema,
  bulkDeleteUsersSchema,
  bulkUpdateUserRolesSchema,
  exportUsersSchema,
  getUserActivitySchema,
  userIdParamSchema
};
