// src/api/v1/users/router.js

const express = require("express");
const {
  registerUserController,
  loginUserController,
  updateUserController,
  getUserByIdController,
  getUsersController,
  deleteUserModel,
  // New controller functions
  changePasswordController,
  forgotPasswordController,
  resetPasswordController,
  getCurrentUserProfileController,
  updateUserProfileController,
  getUserActivityController,
  activateUserController,
  deactivateUserController,
  bulkDeleteUsersController,
  bulkUpdateUserRolesController,
  exportUsersController,
  getUserLoginHistoryController,
  logoutController,
  deleteUserController
} = require("./controller");
const { checkUserAuthorized } = require("../../../helpers/common");
const {
  registerUserSchema,
  loginUserSchema,
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
} = require("../../../validators/userValidator");
const { requireManagement, requirePermission, requireAdmin } = require("../../../helpers/permissions");
const validateRequest = require("../../../middleware/validateRequest");

const router = express.Router();

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 *     description: Returns a paginated list of users with optional filtering. Requires 'users' read permission.
 *     tags: [User Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name, username, or email
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [enabled, disabled]
 *         description: Filter by user status
 *     responses:
 *       200:
 *         description: List of users with pagination metadata
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.get("/", checkUserAuthorized(), requirePermission('users', 'read'), (req, res) => {
  getUsersController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Returns a specific user by their ID. Users can view their own profile, others need 'users' read permission.
 *     tags: [User Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.get("/:id", checkUserAuthorized(), validateRequest(userIdParamSchema), (req, res) => {
  getUserByIdController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account. Requires 'users' create permission.
 *     tags: [User Management]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - email
 *               - password
 *               - phone
 *               - department_id
 *               - restaurant_id
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "password123"
 *               phone:
 *                 type: string
 *                 example: "00964771234567"
 *               department_id:
 *                 type: integer
 *                 example: 5
 *                 description: "Department ID (1=Admin, 2=Restaurant Admin, 3=Branch Admin, 4=Inventory Admin, 5=Captain, 6=Kitchen, 7=Hookah, 8=Finance)"
 *               restaurant_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       409:
 *         description: User already exists
 */
router.post("/register", checkUserAuthorized(), requirePermission('users', 'create'), validateRequest(registerUserSchema), (req, res) => {
  registerUserController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns a token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserLogin'
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 *       401:
 *         description: Authentication failed
 */
router.post("/", validateRequest(loginUserSchema), (req, res) => {
  loginUserController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user
 *     description: Updates an existing user's information. Requires 'users' update permission.
 *     tags: [User Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *               username:
 *                 type: string
 *                 example: "johndoe"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john@example.com"
 *               phone:
 *                 type: string
 *                 example: "00964771234567"
 *               department_id:
 *                 type: integer
 *                 example: 5
 *               restaurant_id:
 *                 type: integer
 *                 example: 1
 *               enabled:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.put("/:id", checkUserAuthorized(), requirePermission('users', 'update'), validateRequest(userIdParamSchema), (req, res) => {
  updateUserController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user
 *     description: Soft deletes a user. Requires 'users' delete permission.
 *     tags: [User Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.delete("/:id", checkUserAuthorized(), requirePermission('users', 'delete'), validateRequest(userIdParamSchema), (req, res) => {
  deleteUserController(req, (result) => {
    res.json(result);
  });
});

// ===============================
// NEW ROUTES - PASSWORD MANAGEMENT
// ===============================

/**
 * @swagger
 * /api/v1/users/change-password:
 *   post:
 *     summary: Change password
 *     description: Allows authenticated user to change their password
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 format: password
 *               newPassword:
 *                 type: string
 *                 format: password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error or incorrect current password
 *       401:
 *         description: Unauthorized
 */
router.post("/change-password", validateRequest(changePasswordSchema), (req, res) => {
  changePasswordController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/v1/users/forgot-password:
 *   post:
 *     summary: Request password reset
 *     description: Sends password reset email to user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Password reset email sent (if email exists)
 *       400:
 *         description: Validation error
 */
router.post("/forgot-password", validateRequest(forgotPasswordSchema), (req, res) => {
  forgotPasswordController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/v1/users/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Resets password using reset token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               token:
 *                 type: string
 *               newPassword:
 *                 type: string
 *                 format: password
 *               confirmPassword:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Validation error or invalid/expired token
 */
router.post("/reset-password", validateRequest(resetPasswordSchema), (req, res) => {
  resetPasswordController(req, (result) => {
    res.json(result);
  });
});

// ===============================
// NEW ROUTES - PROFILE MANAGEMENT
// ===============================

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Get current user profile
 *     description: Returns the authenticated user's profile information
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", checkUserAuthorized(), (req, res) => {
  getCurrentUserProfileController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/v1/users/profile:
 *   put:
 *     summary: Update user profile
 *     description: Updates the authenticated user's profile information
 *     tags: [Profile]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.put("/profile", checkUserAuthorized(), validateRequest(profileUpdateSchema), (req, res) => {
  updateUserProfileController(req, (result) => {
    res.json(result);
  });
});

// ===============================
// NEW ROUTES - USER MANAGEMENT
// ===============================

/**
 * @swagger
 * /api/v1/users/{id}/activate:
 *   post:
 *     summary: Activate user
 *     description: Activates a disabled user account. Requires 'users' update permission.
 *     tags: [User Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User activated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.post("/:id/activate", checkUserAuthorized(), requirePermission('users', 'update'), validateRequest(userIdParamSchema), (req, res) => {
  activateUserController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/v1/users/{id}/deactivate:
 *   post:
 *     summary: Deactivate user
 *     description: Deactivates an active user account. Requires 'users' update permission.
 *     tags: [User Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deactivated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.post("/:id/deactivate", checkUserAuthorized(), requirePermission('users', 'update'), validateRequest(userIdParamSchema), (req, res) => {
  deactivateUserController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/v1/users/{id}/activity:
 *   get:
 *     summary: Get user activity
 *     description: Returns user activity logs with pagination. Admin only.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: User activity retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/:id/activity", checkUserAuthorized(), requireAdmin, validateRequest(userIdParamSchema), (req, res) => {
  getUserActivityController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/v1/users/{id}/login-history:
 *   get:
 *     summary: Get user login history
 *     description: Returns user login/logout history with pagination. Admin only.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of records per page
 *     responses:
 *       200:
 *         description: Login history retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get("/:id/login-history", checkUserAuthorized(), requireAdmin, validateRequest(userIdParamSchema), (req, res) => {
  getUserLoginHistoryController(req, (result) => {
    res.json(result);
  });
});

// ===============================
// NEW ROUTES - BULK OPERATIONS
// ===============================

/**
 * @swagger
 * /api/v1/users/bulk-delete:
 *   post:
 *     summary: Bulk delete users
 *     description: Soft deletes multiple users at once. Admin only.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_ids
 *             properties:
 *               user_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 example: [2, 3, 4]
 *     responses:
 *       200:
 *         description: Users deleted successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post("/bulk-delete", checkUserAuthorized(), requireAdmin, (req, res) => {
  bulkDeleteUsersController(req, (result) => {
    res.json(result);
  });
});

/**
 * @swagger
 * /api/v1/users/bulk-update-roles:
 *   post:
 *     summary: Bulk update user roles
 *     description: Updates roles for multiple users at once
 *     tags: [Bulk Operations]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_ids
 *               - roles
 *             properties:
 *               user_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *               roles:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: User roles updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Insufficient permissions
 */
router.post("/bulk-update-roles", checkUserAuthorized(), validateRequest(bulkUpdateUserRolesSchema), (req, res) => {
  bulkUpdateUserRolesController(req, (result) => {
    res.json(result);
  });
});

// ===============================
// NEW ROUTES - EXPORT & REPORTS
// ===============================

/**
 * @swagger
 * /api/v1/users/export:
 *   get:
 *     summary: Export users
 *     description: Exports user data in specified format. Management level access required.
 *     tags: [Management]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json, xlsx]
 *           default: csv
 *         description: Export format
 *     responses:
 *       200:
 *         description: Users exported successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Management access required
 */
router.get("/export", checkUserAuthorized(), requireManagement, (req, res) => {
  exportUsersController(req, (result) => {
    res.json(result);
  });
});

// ===============================
// NEW ROUTES - SESSION MANAGEMENT
// ===============================

/**
 * @swagger
 * /api/v1/users/logout:
 *   post:
 *     summary: Logout user
 *     description: Logs out the authenticated user
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/logout", checkUserAuthorized(), (req, res) => {
  logoutController(req, (result) => {
    res.json(result);
  });
});

module.exports = router;