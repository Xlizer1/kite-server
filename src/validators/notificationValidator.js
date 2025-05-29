const Joi = require("joi");

// Schema for registering FCM token
const registerFCMTokenSchema = Joi.object({
    fcm_token: Joi.string().required().messages({
        "string.base": "FCM token must be a string",
        "any.required": "FCM token is required"
    }),
    device_info: Joi.object({
        platform: Joi.string().valid('android', 'ios', 'web').optional().messages({
            "string.base": "Platform must be a string",
            "any.only": "Platform must be one of: android, ios, web"
        }),
        version: Joi.string().optional().messages({
            "string.base": "Version must be a string"
        }),
        model: Joi.string().optional().messages({
            "string.base": "Model must be a string"
        }),
        browser: Joi.string().optional().messages({
            "string.base": "Browser must be a string"
        }),
        os_version: Joi.string().optional().messages({
            "string.base": "OS version must be a string"
        })
    }).optional()
});

// Schema for sending notifications
const sendNotificationSchema = Joi.object({
    departments: Joi.array().items(
        Joi.number().integer().min(1).max(8)
    ).optional().messages({
        "array.base": "Departments must be an array",
        "number.base": "Department ID must be a number",
        "number.integer": "Department ID must be an integer",
        "number.min": "Department ID must be at least 1",
        "number.max": "Department ID must be at most 8"
    }),
    user_ids: Joi.array().items(
        Joi.number().integer().positive()
    ).optional().messages({
        "array.base": "User IDs must be an array",
        "number.base": "User ID must be a number",
        "number.integer": "User ID must be an integer",
        "number.positive": "User ID must be positive"
    }),
    type: Joi.string().required().messages({
        "string.base": "Type must be a string",
        "any.required": "Type is required"
    }),
    title: Joi.string().min(1).max(100).required().messages({
        "string.base": "Title must be a string",
        "string.min": "Title cannot be empty",
        "string.max": "Title cannot exceed 100 characters",
        "any.required": "Title is required"
    }),
    message: Joi.string().min(1).max(500).required().messages({
        "string.base": "Message must be a string",
        "string.min": "Message cannot be empty",
        "string.max": "Message cannot exceed 500 characters",
        "any.required": "Message is required"
    }),
    data: Joi.object().optional().messages({
        "object.base": "Data must be an object"
    }),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').default('normal').messages({
        "string.base": "Priority must be a string",
        "any.only": "Priority must be one of: low, normal, high, urgent"
    }),
    action_required: Joi.boolean().default(false).messages({
        "boolean.base": "Action required must be a boolean"
    }),
    persistent: Joi.boolean().default(false).messages({
        "boolean.base": "Persistent must be a boolean"
    }),
    sound: Joi.string().optional().messages({
        "string.base": "Sound must be a string"
    }),
    actions: Joi.array().items(
        Joi.object({
            action: Joi.string().required().messages({
                "string.base": "Action must be a string",
                "any.required": "Action is required"
            }),
            title: Joi.string().required().messages({
                "string.base": "Action title must be a string",
                "any.required": "Action title is required"
            }),
            icon: Joi.string().optional().messages({
                "string.base": "Action icon must be a string"
            })
        })
    ).optional().messages({
        "array.base": "Actions must be an array"
    })
}).custom((value, helpers) => {
    // At least one target (departments or user_ids) must be specified
    if (!value.departments?.length && !value.user_ids?.length) {
        return helpers.error('custom.missingTarget');
    }
    return value;
}).messages({
    'custom.missingTarget': 'Either departments or user_ids must be specified'
});

// Schema for handling notification actions
const handleActionSchema = Joi.object({
    notification_id: Joi.string().required().messages({
        "string.base": "Notification ID must be a string",
        "any.required": "Notification ID is required"
    }),
    action: Joi.string().required().messages({
        "string.base": "Action must be a string",
        "any.required": "Action is required"
    }),
    notes: Joi.string().max(500).optional().messages({
        "string.base": "Notes must be a string",
        "string.max": "Notes cannot exceed 500 characters"
    })
});

// Schema for notification query parameters
const getNotificationsQuerySchema = Joi.object({
    limit: Joi.number().integer().min(1).max(100).default(50).messages({
        "number.base": "Limit must be a number",
        "number.integer": "Limit must be an integer",
        "number.min": "Limit must be at least 1",
        "number.max": "Limit cannot exceed 100"
    }),
    type: Joi.string().optional().messages({
        "string.base": "Type must be a string"
    }),
    unread_only: Joi.boolean().default(false).messages({
        "boolean.base": "Unread only must be a boolean"
    }),
    priority: Joi.string().valid('low', 'normal', 'high', 'urgent').optional().messages({
        "string.base": "Priority must be a string",
        "any.only": "Priority must be one of: low, normal, high, urgent"
    })
});

// Schema for notification ID parameter
const notificationIdParamSchema = Joi.object({
    notification_id: Joi.string().required().messages({
        "string.base": "Notification ID must be a string",
        "any.required": "Notification ID is required"
    })
});

// Common notification types (for documentation/validation)
const NOTIFICATION_TYPES = {
    // Order Management
    ORDER_CREATED: 'ORDER_CREATED',
    ORDER_APPROVED: 'ORDER_APPROVED',
    ORDER_READY: 'ORDER_READY',
    ORDER_COMPLETED: 'ORDER_COMPLETED',
    ORDER_CANCELLED: 'ORDER_CANCELLED',
    
    // Customer Service
    CAPTAIN_CALL: 'CAPTAIN_CALL',
    CUSTOMER_COMPLAINT: 'CUSTOMER_COMPLAINT',
    
    // Inventory Management
    LOW_STOCK_ALERT: 'LOW_STOCK_ALERT',
    CRITICAL_INVENTORY: 'CRITICAL_INVENTORY',
    STOCK_UPDATED: 'STOCK_UPDATED',
    INVENTORY_THRESHOLD_REACHED: 'INVENTORY_THRESHOLD_REACHED',
    
    // Financial
    PAYMENT_RECEIVED: 'PAYMENT_RECEIVED',
    LARGE_PAYMENT: 'LARGE_PAYMENT',
    DAILY_SALES_REPORT: 'DAILY_SALES_REPORT',
    INVOICE_GENERATED: 'INVOICE_GENERATED',
    
    // Staff Management
    NEW_STAFF: 'NEW_STAFF',
    STAFF_SCHEDULE_UPDATE: 'STAFF_SCHEDULE_UPDATE',
    SHIFT_REMINDER: 'SHIFT_REMINDER',
    
    // System Management
    SYSTEM_MAINTENANCE: 'SYSTEM_MAINTENANCE',
    SYSTEM_UPDATE: 'SYSTEM_UPDATE',
    BACKUP_COMPLETED: 'BACKUP_COMPLETED',
    SYSTEM_ERROR: 'SYSTEM_ERROR',
    
    // Communication
    DIRECT_MESSAGE: 'DIRECT_MESSAGE',
    BROADCAST_MESSAGE: 'BROADCAST_MESSAGE',
    MEETING_REMINDER: 'MEETING_REMINDER',
    
    // Emergency
    EMERGENCY: 'EMERGENCY',
    SECURITY_ALERT: 'SECURITY_ALERT',
    FIRE_ALERT: 'FIRE_ALERT'
};

// Priority levels
const PRIORITY_LEVELS = {
    LOW: 'low',
    NORMAL: 'normal', 
    HIGH: 'high',
    URGENT: 'urgent'
};

// Department IDs for reference
const DEPARTMENTS = {
    ADMIN: 1,
    RESTAURANT_ADMIN: 2,
    BRANCH_ADMIN: 3,
    INVENTORY_ADMIN: 4,
    CAPTAIN: 5,
    KITCHEN: 6,
    HOOKAH: 7,
    FINANCE: 8
};

module.exports = {
    registerFCMTokenSchema,
    sendNotificationSchema,
    handleActionSchema,
    getNotificationsQuerySchema,
    notificationIdParamSchema,
    NOTIFICATION_TYPES,
    PRIORITY_LEVELS,
    DEPARTMENTS
};