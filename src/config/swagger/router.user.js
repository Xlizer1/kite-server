const express = require("express");
const { registerUserController, loginUserController, updateUserController, getUserByIdController, getUsersController, deleteUserModel } = require("../../api/user/controller");
const { registerUserSchema, loginUserSchema } = require("../../validators/userValidator");
const validateRequest = require("../../middleware/validateRequest");
const { getEndpoint, postEndpoint, putEndpoint, deleteEndpoint, pathParam, tagDoc } = require('./route-docs');

const router = express.Router();

// Add tag documentation
tagDoc('Users', 'User management endpoints');

// GET all users
getEndpoint('/api/user', 'Get all users', 'Retrieves a list of all users', 'Users', 'User');
router.get("/", (req, res) => {
  getUsersController(req, (result) => {
    res.json(result);
  });
});

// GET user by ID
getEndpoint(
  '/api/user/{id}', 
  'Get user by ID', 
  'Retrieves a specific user by their ID', 
  'Users', 
  'User', 
  [pathParam('id', 'User ID', 'integer')]
);
router.get("/:id", (req, res) => {
  getUserByIdController(req, (result) => {
    res.json(result);
  });
});

// UPDATE user
putEndpoint(
  '/api/user/{id}', 
  'Update user', 
  'Updates an existing user', 
  'Users', 
  'UserRegistration', 
  'User', 
  [pathParam('id', 'User ID', 'integer')]
);
router.put("/:id", validateRequest(registerUserSchema), (req, res) => {
  updateUserController(req, (result) => {
    res.json(result);
  });
});

// DELETE user
deleteEndpoint(
  '/api/user/{id}', 
  'Delete user', 
  'Deletes an existing user', 
  'Users', 
  [pathParam('id', 'User ID', 'integer')]
);
router.delete("/:id", (req, res) => {
  deleteUserModel(req, (result) => {
    res.json(result);
  });
});

// REGISTER user
postEndpoint(
  '/api/user/register', 
  'Register new user', 
  'Creates a new user account', 
  'Users', 
  'UserRegistration', 
  'User'
);
router.post("/register", (req, res) => {
  registerUserController(req, (result) => {
    res.json(result);
  });
});

// LOGIN user
postEndpoint(
  '/api/user', 
  'User login', 
  'Authenticates a user and returns a token', 
  'Users', 
  'UserLogin', 
  'User'
);
router.post("/", (req, res) => {
  loginUserController(req, (result) => {
    res.json(result);
  });
});

module.exports = router;
