const { resultObject } = require("../helpers/common");

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

class ValidationError extends AppError {
    constructor(message) {
        super(message, 400);
        this.name = "ValidationError";
    }
}

class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
        this.name = "AuthenticationError";
    }
}

class AuthorizationError extends AppError {
    constructor(message = 'Not authorized') {
        super(message, 403);
        this.name = "AuthorizationError";
    }
}

class NotFoundError extends AppError {
    constructor(message) {
        super(message, 404);
        this.name = "NotFoundError";
    }
}

class ConflictError extends AppError {
    constructor(message) {
        super(message, 409);
        this.name = "ConflictError";
    }
}

class DatabaseError extends AppError {
    constructor(message = 'Database operation failed', originalError = null) {
        super(message, 500);
        this.name = "DatabaseError";
        this.originalError = originalError;
    }
}

class BusinessLogicError extends AppError {
    constructor(message) {
        super(message, 422);
        this.name = "BusinessLogicError";
    }
}

// For backward compatibility
class CustomError extends AppError {
    constructor(message, statusCode = 500) {
        super(message, statusCode);
        this.name = "CustomError";
        console.warn('CustomError is deprecated. Please use specific error types.');
    }
}

const logError = (err) => {
    const errorLog = {
        timestamp: new Date().toISOString(),
        name: err.name,
        message: err.message,
        stack: err.stack,
        isOperational: err.isOperational || false
    };

    if (err.originalError) {
        errorLog.originalError = {
            name: err.originalError.name,
            message: err.originalError.message,
            stack: err.originalError.stack
        };
    }

    // Log error details
    console.error('Error occurred:', JSON.stringify(errorLog, null, 2));
};

const handleError = (err, res) => {
    // Log all errors
    logError(err);

    // Handle known errors
    if (err.isOperational) {
        return res.status(err.statusCode).json(
            resultObject(
                false,
                err.message,
                null,
                err.statusCode
            )
        );
    }

    // Handle unknown errors
    return res.status(500).json(
        resultObject(
            false,
            process.env.NODE_ENV === 'production' 
                ? 'An unexpected error occurred' 
                : err.message,
            null,
            500
        )
    );
};

const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => {
            handleError(err, res);
        });
    };
};

module.exports = {
    AppError,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    DatabaseError,
    BusinessLogicError,
    CustomError,
    handleError,
    asyncHandler
};