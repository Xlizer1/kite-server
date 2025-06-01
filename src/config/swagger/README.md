# Swagger Documentation System

This directory contains a modular approach to Swagger documentation for the Kite API.

## Directory Structure

```
swagger/
├── config.js           # Main Swagger configuration
├── route-docs.js       # Helper functions for route documentation
├── schemas/            # Schema definitions
│   ├── cart.schema.js
│   ├── common.schema.js
│   ├── menu.schema.js
│   ├── restaurant.schema.js
│   └── user.schema.js
└── README.md           # This file
```

## How to Use

### 1. Schema Definitions

All data models are defined in the `schemas/` directory. Each file contains JSDoc comments that define Swagger schemas.

To add a new schema:
1. Create a new file in the `schemas/` directory (e.g., `order.schema.js`)
2. Define your schema using JSDoc comments
3. The schema will be automatically included in the Swagger documentation

### 2. Route Documentation

Instead of writing repetitive Swagger documentation in each router file, use the helper functions in `route-docs.js`:

```javascript
const { getEndpoint, postEndpoint, putEndpoint, deleteEndpoint, pathParam, queryParam, tagDoc } = require('../../config/swagger/route-docs');

// Define a tag for grouping endpoints
tagDoc('Users', 'User management endpoints');

// Document a GET endpoint
getEndpoint(
  '/api/users/{id}', 
  'Get user by ID', 
  'Retrieves a specific user by their ID', 
  'Users', 
  'User', 
  [pathParam('id', 'User ID', 'integer')]
);
router.get("/:id", (req, res) => {
  // Route handler code
});

// Document a POST endpoint
postEndpoint(
  '/api/users/register', 
  'Register new user', 
  'Creates a new user account', 
  'Users', 
  'UserRegistration', 
  'User'
);
router.post("/register", (req, res) => {
  // Route handler code
});
```

### 3. Parameters

Use the parameter helper functions to define path and query parameters:

```javascript
// Path parameter
pathParam('id', 'User ID', 'integer')

// Query parameter
queryParam('page', 'Page number', 'integer', false, 1)
```

### 4. Example

See `src/api/user/router.example.js` for a complete example of how to use the helper functions.

## Benefits

- **Reduced repetition**: Common patterns are extracted into reusable functions
- **Centralized schemas**: All data models are defined in one place
- **Easier maintenance**: Update schemas in one place instead of across multiple files
- **Consistent documentation**: Standardized format for all endpoints
- **Better organization**: Clear separation of concerns between code and documentation

## Extending

To add new helper functions or schemas, simply:

1. Add new schema files to the `schemas/` directory
2. Add new helper functions to `route-docs.js`
3. Update `config.js` if you need to change the Swagger configuration

The Swagger UI will be available at `/api-docs` after restarting the server.
