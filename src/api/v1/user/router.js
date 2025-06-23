const express = require("express");
const {
    registerUserController,
    loginUserController,
    updateUserController,
    getUserByIdController,
    getUsersController,
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
    deleteUserController,
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
    userIdParamSchema,
    userUpdateSchema,
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
router.get("/", checkUserAuthorized(), requirePermission("users", "read"), (req, res) => {
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
router.get(
    "/:id",
    checkUserAuthorized(),
    validateRequest(userIdParamSchema),
    requirePermission("users", "read"),
    (req, res) => {
        getUserByIdController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/users/register:
 *   post:
 *     summary: Register a new user
 */
router.post(
    "/register",
    checkUserAuthorized(),
    requirePermission("users", "create"),
    validateRequest(registerUserSchema),
    (req, res) => {
        registerUserController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/users/change-password:
 *   post:
 *     summary: Change password
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
 */
router.post("/reset-password", validateRequest(resetPasswordSchema), (req, res) => {
    resetPasswordController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/users/bulk-delete:
 *   post:
 *     summary: Bulk delete users
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
 */
router.post("/bulk-update-roles", checkUserAuthorized(), validateRequest(bulkUpdateUserRolesSchema), (req, res) => {
    bulkUpdateUserRolesController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/users/export:
 *   get:
 *     summary: Export users
 */
router.get("/export", checkUserAuthorized(), requireManagement, (req, res) => {
    exportUsersController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/users/logout:
 *   post:
 *     summary: Logout user
 */
router.post("/logout", checkUserAuthorized(), (req, res) => {
    logoutController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/users/profile:
 *   get:
 *     summary: Get current user profile
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
 */
router.put("/profile", checkUserAuthorized(), validateRequest(profileUpdateSchema), (req, res) => {
    updateUserProfileController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users
 */
router.get("/", checkUserAuthorized(), requirePermission("users", "read"), (req, res) => {
    getUsersController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: User login
 */
router.post("/", validateRequest(loginUserSchema), (req, res) => {
    loginUserController(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/users/{id}:
 *   get:
 *     summary: Get user by ID
 */
router.get(
    "/:id",
    checkUserAuthorized(),
    validateRequest(userIdParamSchema),
    requirePermission("users", "read"),
    (req, res) => {
        getUserByIdController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   put:
 *     summary: Update user
 */
router.put(
    "/:id",
    checkUserAuthorized(),
    requirePermission("users", "update"),
    validateRequest(userUpdateSchema),
    (req, res) => {
        updateUserController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/users/{id}:
 *   delete:
 *     summary: Delete user
 */
router.delete(
    "/:id",
    checkUserAuthorized(),
    requirePermission("users", "delete"),
    validateRequest(userIdParamSchema),
    (req, res) => {
        deleteUserController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/users/{id}/activate:
 *   post:
 *     summary: Activate user
 */
router.post(
    "/:id/activate",
    checkUserAuthorized(),
    requirePermission("users", "update"),
    validateRequest(userIdParamSchema),
    (req, res) => {
        activateUserController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/users/{id}/deactivate:
 *   post:
 *     summary: Deactivate user
 */
router.post(
    "/:id/deactivate",
    checkUserAuthorized(),
    requirePermission("users", "update"),
    validateRequest(userIdParamSchema),
    (req, res) => {
        deactivateUserController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/users/{id}/activity:
 *   get:
 *     summary: Get user activity
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
 */
router.get(
    "/:id/login-history",
    checkUserAuthorized(),
    requireAdmin,
    validateRequest(userIdParamSchema),
    (req, res) => {
        getUserLoginHistoryController(req, (result) => {
            res.json(result);
        });
    }
);

/**
 * @swagger
 * /api/v1/users/bulk-delete:
 *   post:
 *     summary: Bulk delete users
 *     description: Soft deletes multiple users at once. Admin only.
 *     tags: [Admin]
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

/**
 * @swagger
 * /api/v1/users/export:
 *   get:
 *     summary: Export users
 *     description: Exports user data in specified format. Management level access required.
 *     tags: [Management]
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

/**
 * @swagger
 * /api/v1/users/logout:
 *   post:
 *     summary: Logout user
 *     description: Logs out the authenticated user
 *     tags: [Authentication]
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
