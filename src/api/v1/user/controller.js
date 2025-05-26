const {
    registerUserModel,
    updateUserModel,
    getUsersModel,
    getUserByIdModel,
    deleteUserModel,
    updateUserPasswordModel,
    updateUserProfileModel,
    checkUserExistsExceptCurrent,
    getUserActivityModel,
    updateUserStatusModel,
    createPasswordResetTokenModel,
    validatePasswordResetTokenModel,
    resetPasswordModel,
    updateLastLoginModel,
    createUserActivityLogModel,
    bulkDeleteUsersModel,
    bulkUpdateUserRolesModel,
    exportUsersModel,
    getUserLoginHistoryModel,
    checkFailedLoginAttemptsModel,
    incrementFailedLoginAttemptsModel,
    resetFailedLoginAttemptsModel
} = require("./model");
const {
    userExists,
    getUser,
    verifyPassword,
    resultObject,
    createToken,
    verifyUserToken,
    getToken,
    hash,
} = require("../../../helpers/common");
const {
    registerUserSchema,
    loginUserSchema,
    changePasswordSchema,
    profileUpdateSchema,
} = require("../../../validators/userValidator");
const { ValidationError } = require("../../../helpers/errors");
const crypto = require("crypto");
const nodemailer = require("nodemailer"); // For sending emails

const getUsers = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (authorize?.roles?.includes(5)) {
            const result = await getUsersModel(request);

            if (result && result.data && Array.isArray(result.data)) {
                callBack(resultObject(true, "success", result));
            } else if (result && result.data && result.data.length === 0) {
                callBack(
                    resultObject(true, "No users found", {
                        data: [],
                        pagination: result.pagination,
                        filters: result.filters,
                    })
                );
            } else {
                callBack(resultObject(false, "Failed to retrieve users"));
            }
        } else {
            callBack(resultObject(false, "You don't have the permission to see users!"));
        }
    } catch (error) {
        if (error instanceof ValidationError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

const getUserById = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        }

        const { id } = request.params;
        if (!id || isNaN(id)) {
            throw new ValidationError("Invalid user ID provided.");
        }

        const user = await getUserByIdModel(id);
        if (user && user?.id) {
            const object = {
                id: user?.id,
                name: user?.name,
                username: user?.username,
                email: user?.email,
                phone: user?.phone,
                enabled: user?.enabled,
                last_login: user?.last_login,
                created_at: user?.created_at,
                roles: user?.roles || [],
                restaurant: user?.restaurant,
                department: user?.department,
            };
            callBack(resultObject(true, "success", object));
        } else {
            throw new ValidationError("User doesn't exist.");
        }
    } catch (error) {
        if (error instanceof ValidationError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

const loginUser = async (request, callBack) => {
    try {
        // const { error } = loginUserSchema.validate(request.body);
        // if (error) {
        //   throw new ValidationError(error.details[0].message);
        // }

        const { username, password } = request.body;

        if (!username || !password) {
            return callBack(resultObject(false, "Please provide username/password!"));
        }

        // Check failed login attempts
        const failedAttempts = await checkFailedLoginAttemptsModel(username);
        if (failedAttempts && failedAttempts.failed_attempts >= 5) {
            const lockTime = new Date(failedAttempts.locked_until);
            if (lockTime > new Date()) {
                return callBack(
                    resultObject(
                        false,
                        "Account is temporarily locked due to too many failed login attempts. Please try again later."
                    )
                );
            }
        }

        const user = await getUser(username);
        if (user && user?.id) {
            // Check if account is enabled
            if (!user.enabled) {
                return callBack(resultObject(false, "Account is disabled. Please contact administrator."));
            }

            const isPasswordCorrect = await verifyPassword(password, user?.password);
            if (isPasswordCorrect) {
                // Reset failed login attempts on success
                await resetFailedLoginAttemptsModel(username);

                // Update last login
                await updateLastLoginModel(user.id);

                // Log successful login
                await createUserActivityLogModel({
                    user_id: user.id,
                    action: "login",
                    description: "User logged in successfully",
                    ip_address: request.ip || request.connection.remoteAddress,
                });

                callBack(
                    resultObject(true, "success", {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        phone: user.phone,
                        department_id: user.department_id,
                        roles: user.roles,
                        token: await createToken(user),
                    })
                );
            } else {
                // Increment failed login attempts
                await incrementFailedLoginAttemptsModel(username);

                // Log failed login attempt
                await createUserActivityLogModel({
                    user_id: user.id,
                    action: "failed_login",
                    description: "Failed login attempt - incorrect password",
                    ip_address: request.ip || request.connection.remoteAddress,
                });

                callBack(resultObject(false, "Wrong Password!"));
            }
        } else {
            callBack(resultObject(false, "User Doesn't exist!"));
        }
    } catch (error) {
        if (error instanceof ValidationError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

const registerUser = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        }

        if (authorize?.roles?.includes(6)) {
            const { error } = registerUserSchema.validate(request.body);
            if (error) {
                throw new ValidationError(error.details[0].message);
            }

            const {
                department_id,
                restaurant_id,
                parent_restaurant_id,
                name,
                username,
                email,
                phone,
                password,
                roles,
            } = request.body;

            const checkUserExists = await userExists(username, email, phone);
            if (checkUserExists) {
                throw new ValidationError("User already exists.");
            }

            const result = await registerUserModel({
                name,
                email,
                username,
                phone,
                password,
                restaurant_id,
                parent_restaurant_id,
                department_id,
                roles,
                created_by: authorize.id,
            });

            if (result?.status === true) {
                // Log user creation
                await createUserActivityLogModel({
                    user_id: authorize.id,
                    action: "user_created",
                    description: `Created new user: ${username}`,
                    target_user_id: result.user_id,
                });

                callBack(resultObject(true, "User created successfully."));
            } else {
                callBack(resultObject(false, "Failed to create user."));
            }
        } else {
            callBack(resultObject(false, "You don't have the permission to create a user!"));
        }
    } catch (error) {
        if (error instanceof ValidationError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
            console.log(error);
        }
    }
};

const updateUser = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        }

        if (authorize?.roles?.includes(7)) {
            const id = request.params.id;
            const { department_id, restaurant_id, parent_restaurant_id, name, username, email, phone, enabled, roles } =
                request.body;

            const result = await updateUserModel({
                department_id,
                restaurant_id,
                parent_restaurant_id,
                name,
                username,
                email,
                phone,
                enabled,
                roles,
                id,
                updated_by: authorize?.id,
            });

            if (result?.status === true) {
                // Log user update
                await createUserActivityLogModel({
                    user_id: authorize.id,
                    action: "user_updated",
                    description: `Updated user: ${username}`,
                    target_user_id: id,
                });

                callBack(resultObject(true, "User updated successfully.", result.user));
            } else {
                callBack(resultObject(false, "Failed to update user."));
            }
        } else {
            callBack(resultObject(false, "You don't have the permission to update a user!"));
        }
    } catch (error) {
        console.log(error);
        if (error instanceof ValidationError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

const deleteUser = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.id || !authorize?.email) {
            callBack(resultObject(false, "Token is invalid!"));
            return;
        }

        if (authorize?.roles?.includes(8)) {
            const { id } = request.params;

            const result = await deleteUserModel({ id, deleted_by: authorize?.id });
            if (result?.status === true) {
                // Log user deletion
                await createUserActivityLogModel({
                    user_id: authorize.id,
                    action: "user_deleted",
                    description: `Deleted user ID: ${id}`,
                    target_user_id: id,
                });

                callBack(resultObject(true, "User deleted successfully."));
            } else {
                callBack(resultObject(false, "Failed to delete user."));
            }
        } else {
            callBack(resultObject(false, "You don't have the permission to delete a user!"));
        }
    } catch (error) {
        if (error instanceof ValidationError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

const changePassword = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.id) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        const { error } = changePasswordSchema.validate(request.body);
        if (error) {
            return callBack(resultObject(false, error.details[0].message));
        }

        const { currentPassword, newPassword } = request.body;

        // Get current user
        const user = await getUserByIdModel(authorize.id);
        if (!user) {
            return callBack(resultObject(false, "User not found"));
        }

        // Verify current password
        const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return callBack(resultObject(false, "Current password is incorrect"));
        }

        // Update password
        const result = await updateUserPasswordModel(authorize.id, newPassword, authorize.id);

        if (result) {
            // Log password change
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "password_changed",
                description: "User changed password",
            });

            callBack(resultObject(true, "Password changed successfully"));
        } else {
            callBack(resultObject(false, "Failed to change password"));
        }
    } catch (error) {
        console.error("Error in changePassword:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

const forgotPassword = async (request, callBack) => {
    try {
        const { email } = request.body;
        if (!email) {
            return callBack(resultObject(false, "Email is required"));
        }

        const user = await getUserByIdModel(null, email);
        if (!user) {
            // Don't reveal if email exists or not for security
            return callBack(resultObject(true, "If the email exists, a password reset link has been sent"));
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        // Save reset token
        await createPasswordResetTokenModel(user.id, resetToken, resetTokenExpiry);

        // Send email (implement your email service)
        // await sendPasswordResetEmail(email, resetToken);

        // Log password reset request
        await createUserActivityLogModel({
            user_id: user.id,
            action: "password_reset_requested",
            description: "Password reset requested via email",
        });

        callBack(resultObject(true, "If the email exists, a password reset link has been sent"));
    } catch (error) {
        console.error("Error in forgotPassword:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

const resetPassword = async (request, callBack) => {
    try {
        const { token, newPassword } = request.body;
        if (!token || !newPassword) {
            return callBack(resultObject(false, "Token and new password are required"));
        }

        if (newPassword.length < 6) {
            return callBack(resultObject(false, "Password must be at least 6 characters long"));
        }

        // Validate reset token
        const tokenData = await validatePasswordResetTokenModel(token);
        if (!tokenData) {
            return callBack(resultObject(false, "Invalid or expired reset token"));
        }

        // Reset password
        const result = await resetPasswordModel(tokenData.user_id, newPassword);

        if (result) {
            // Log password reset
            await createUserActivityLogModel({
                user_id: tokenData.user_id,
                action: "password_reset",
                description: "Password reset completed via reset token",
            });

            callBack(resultObject(true, "Password reset successfully"));
        } else {
            callBack(resultObject(false, "Failed to reset password"));
        }
    } catch (error) {
        console.error("Error in resetPassword:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

const getCurrentUserProfile = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.id) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        const user = await getUserByIdModel(authorize.id);
        if (!user) {
            return callBack(resultObject(false, "User not found"));
        }

        // Remove sensitive information
        delete user.password;

        callBack(resultObject(true, "Profile retrieved successfully", user));
    } catch (error) {
        console.error("Error in getCurrentUserProfile:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

const updateUserProfile = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.id) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        const { error } = profileUpdateSchema.validate(request.body);
        if (error) {
            return callBack(resultObject(false, error.details[0].message));
        }

        const { name, email, phone } = request.body;

        // Check if email/phone is already taken by another user
        const existingUser = await checkUserExistsExceptCurrent(email, phone, authorize.id);
        if (existingUser) {
            return callBack(resultObject(false, "Email or phone already taken by another user"));
        }

        const result = await updateUserProfileModel(authorize.id, { name, email, phone }, authorize.id);

        if (result.status) {
            // Log profile update
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "profile_updated",
                description: "User updated their profile",
            });

            callBack(resultObject(true, "Profile updated successfully", result.user));
        } else {
            callBack(resultObject(false, "Failed to update profile"));
        }
    } catch (error) {
        console.error("Error in updateUserProfile:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

const getUserActivity = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.roles?.includes(1)) {
            // Admin role
            return callBack(resultObject(false, "You don't have permission to view user activity"));
        }

        const { user_id } = request.params;
        const { page = 1, limit = 10 } = request.query;

        const result = await getUserActivityModel(user_id, page, limit);

        if (result) {
            callBack(resultObject(true, "User activity retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve user activity"));
        }
    } catch (error) {
        console.error("Error in getUserActivity:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

const activateUser = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.roles?.includes(1)) {
            // Admin role
            return callBack(resultObject(false, "You don't have permission to activate users"));
        }

        const { id } = request.params;

        const result = await updateUserStatusModel(id, 1, authorize.id); // 1 = enabled

        if (result) {
            // Log user activation
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "user_activated",
                description: `Activated user ID: ${id}`,
                target_user_id: id,
            });

            callBack(resultObject(true, "User activated successfully"));
        } else {
            callBack(resultObject(false, "Failed to activate user"));
        }
    } catch (error) {
        console.error("Error in activateUser:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

const deactivateUser = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.roles?.includes(1)) {
            // Admin role
            return callBack(resultObject(false, "You don't have permission to deactivate users"));
        }

        const { id } = request.params;

        const result = await updateUserStatusModel(id, 0, authorize.id); // 0 = disabled

        if (result) {
            // Log user deactivation
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "user_deactivated",
                description: `Deactivated user ID: ${id}`,
                target_user_id: id,
            });

            callBack(resultObject(true, "User deactivated successfully"));
        } else {
            callBack(resultObject(false, "Failed to deactivate user"));
        }
    } catch (error) {
        console.error("Error in deactivateUser:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

const bulkDeleteUsers = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.roles?.includes(1)) {
            // Admin role
            return callBack(resultObject(false, "You don't have permission to bulk delete users"));
        }

        const { user_ids } = request.body;

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return callBack(resultObject(false, "User IDs array is required"));
        }

        const result = await bulkDeleteUsersModel(user_ids, authorize.id);

        if (result.status) {
            // Log bulk deletion
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "bulk_delete_users",
                description: `Bulk deleted ${user_ids.length} users`,
            });

            callBack(resultObject(true, `Successfully deleted ${result.deletedCount} users`));
        } else {
            callBack(resultObject(false, "Failed to delete users"));
        }
    } catch (error) {
        console.error("Error in bulkDeleteUsers:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

const bulkUpdateUserRoles = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.roles?.includes(1)) {
            // Admin role
            return callBack(resultObject(false, "You don't have permission to bulk update user roles"));
        }

        const { user_ids, roles } = request.body;

        if (!user_ids || !Array.isArray(user_ids) || user_ids.length === 0) {
            return callBack(resultObject(false, "User IDs array is required"));
        }

        if (!roles || !Array.isArray(roles) || roles.length === 0) {
            return callBack(resultObject(false, "Roles array is required"));
        }

        const result = await bulkUpdateUserRolesModel(user_ids, roles, authorize.id);

        if (result.status) {
            // Log bulk role update
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "bulk_update_roles",
                description: `Bulk updated roles for ${user_ids.length} users`,
            });

            callBack(resultObject(true, `Successfully updated roles for ${result.updatedCount} users`));
        } else {
            callBack(resultObject(false, "Failed to update user roles"));
        }
    } catch (error) {
        console.error("Error in bulkUpdateUserRoles:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

const exportUsers = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.roles?.includes(1)) {
            // Admin role
            return callBack(resultObject(false, "You don't have permission to export users"));
        }

        const { format = "csv" } = request.query;

        const result = await exportUsersModel(format);

        if (result.status) {
            // Log export
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "export_users",
                description: `Exported users in ${format} format`,
            });

            callBack(resultObject(true, "Users exported successfully", result.data));
        } else {
            callBack(resultObject(false, "Failed to export users"));
        }
    } catch (error) {
        console.error("Error in exportUsers:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

const getUserLoginHistory = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.roles?.includes(1)) {
            // Admin role
            return callBack(resultObject(false, "You don't have permission to view login history"));
        }

        const { user_id } = request.params;
        const { page = 1, limit = 10 } = request.query;

        const result = await getUserLoginHistoryModel(user_id, page, limit);

        if (result) {
            callBack(resultObject(true, "Login history retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve login history"));
        }
    } catch (error) {
        console.error("Error in getUserLoginHistory:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

const logout = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);
        if (!authorize?.id) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Log logout
        await createUserActivityLogModel({
            user_id: authorize.id,
            action: "logout",
            description: "User logged out",
            ip_address: request.ip || request.connection.remoteAddress,
        });

        // In a more sophisticated setup, you'd invalidate the token
        // For now, just log the logout action
        callBack(resultObject(true, "Logged out successfully"));
    } catch (error) {
        console.error("Error in logout:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

module.exports = {
    getUserByIdController: getUserById,
    registerUserController: registerUser,
    loginUserController: loginUser,
    getUsersController: getUsers,
    updateUserController: updateUser,
    deleteUserModel: deleteUser,
    getUserByIdController: getUserById,
    registerUserController: registerUser,
    loginUserController: loginUser,
    getUsersController: getUsers,
    updateUserController: updateUser,
    deleteUserController: deleteUser,
    // New exports - Password Management
    changePasswordController: changePassword,
    forgotPasswordController: forgotPassword,
    resetPasswordController: resetPassword,

    // New exports - Profile Management
    getCurrentUserProfileController: getCurrentUserProfile,
    updateUserProfileController: updateUserProfile,

    // New exports - User Activity & Management
    getUserActivityController: getUserActivity,
    activateUserController: activateUser,
    deactivateUserController: deactivateUser,

    // New exports - Bulk Operations
    bulkDeleteUsersController: bulkDeleteUsers,
    bulkUpdateUserRolesController: bulkUpdateUserRoles,

    // New exports - Export & Reports
    exportUsersController: exportUsers,
    getUserLoginHistoryController: getUserLoginHistory,

    // New exports - Session Management
    logoutController: logout,
};
