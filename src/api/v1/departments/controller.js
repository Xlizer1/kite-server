// src/api/v1/departments/controller.js

const {
    getDepartmentsModel,
    getDepartmentByIdModel,
    createDepartmentModel,
    updateDepartmentModel,
    deleteDepartmentModel,
    getDepartmentUsersModel,
    getDepartmentStatsModel,
} = require("./model");

const { resultObject, verifyUserToken, getToken } = require("../../../helpers/common");

const { isAdmin, hasPermission } = require("../../../helpers/permissions");
const { createUserActivityLogModel } = require("../user/model");
const { ValidationError, CustomError } = require("../../../middleware/errorHandler");

/**
 * Get all departments
 * All authenticated users can view departments (for dropdowns, etc.)
 */
const getDepartments = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        const result = await getDepartmentsModel(request, authorize);

        if (result && result.data) {
            callBack(resultObject(true, "Departments retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve departments"));
        }
    } catch (error) {
        console.error("Error in getDepartments:", error);
        if (error instanceof CustomError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

/**
 * Get department by ID
 * All authenticated users can view department details
 */
const getDepartmentById = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        const { id } = request.params;
        if (!id || isNaN(id)) {
            return callBack(resultObject(false, "Invalid department ID provided"));
        }

        const department = await getDepartmentByIdModel(id);
        if (!department) {
            return callBack(resultObject(false, "Department not found"));
        }

        callBack(resultObject(true, "Department retrieved successfully", department));
    } catch (error) {
        console.error("Error in getDepartmentById:", error);
        if (error instanceof CustomError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

/**
 * Create new department
 * Only admin users can create departments
 */
const createDepartment = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Only admin can create departments
        if (!isAdmin(authorize.department_id)) {
            return callBack(resultObject(false, "Only administrators can create departments"));
        }

        const { name } = request.body;

        // Validate input
        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return callBack(resultObject(false, "Department name is required"));
        }

        if (name.trim().length < 2) {
            return callBack(resultObject(false, "Department name must be at least 2 characters long"));
        }

        if (name.trim().length > 50) {
            return callBack(resultObject(false, "Department name cannot exceed 50 characters"));
        }

        const result = await createDepartmentModel({ name: name.trim() });

        if (result.status) {
            // Log department creation
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "department_created",
                description: `Created new department: ${name.trim()}`,
                ip_address: request.ip || request.connection.remoteAddress,
            });

            callBack(resultObject(true, "Department created successfully", result.department));
        } else {
            callBack(resultObject(false, "Failed to create department"));
        }
    } catch (error) {
        console.error("Error in createDepartment:", error);
        if (error instanceof CustomError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

/**
 * Update department
 * Only admin users can update departments
 */
const updateDepartment = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Only admin can update departments
        if (!isAdmin(authorize.department_id)) {
            return callBack(resultObject(false, "Only administrators can update departments"));
        }

        const { id } = request.params;
        const { name } = request.body;

        // Validate input
        if (!id || isNaN(id)) {
            return callBack(resultObject(false, "Invalid department ID provided"));
        }

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return callBack(resultObject(false, "Department name is required"));
        }

        if (name.trim().length < 2) {
            return callBack(resultObject(false, "Department name must be at least 2 characters long"));
        }

        if (name.trim().length > 50) {
            return callBack(resultObject(false, "Department name cannot exceed 50 characters"));
        }

        // Prevent updating critical system departments
        const criticalDepartments = [1]; // Admin department
        if (criticalDepartments.includes(parseInt(id))) {
            return callBack(resultObject(false, "Cannot modify critical system departments"));
        }

        const result = await updateDepartmentModel(id, { name: name.trim() });

        if (result.status) {
            // Log department update
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "department_updated",
                description: `Updated department ID ${id}: ${name.trim()}`,
                ip_address: request.ip || request.connection.remoteAddress,
            });

            callBack(resultObject(true, "Department updated successfully", result.department));
        } else {
            callBack(resultObject(false, "Failed to update department"));
        }
    } catch (error) {
        console.error("Error in updateDepartment:", error);
        if (error instanceof CustomError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

/**
 * Delete department
 * Only admin users can delete departments (with safety checks)
 */
const deleteDepartment = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Only admin can delete departments
        if (!isAdmin(authorize.department_id)) {
            return callBack(resultObject(false, "Only administrators can delete departments"));
        }

        const { id } = request.params;

        // Validate input
        if (!id || isNaN(id)) {
            return callBack(resultObject(false, "Invalid department ID provided"));
        }

        const result = await deleteDepartmentModel(id);

        if (result.status) {
            // Log department deletion
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "department_deleted",
                description: `Deleted department ID ${id}`,
                ip_address: request.ip || request.connection.remoteAddress,
            });

            callBack(resultObject(true, result.message));
        } else {
            callBack(resultObject(false, "Failed to delete department"));
        }
    } catch (error) {
        console.error("Error in deleteDepartment:", error);
        if (error instanceof CustomError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

/**
 * Get users in a specific department
 * Only admin and management can view department users
 */
const getDepartmentUsers = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Only admin and management can view department users
        if (!hasPermission(authorize.department_id, "users", "read")) {
            return callBack(resultObject(false, "You don't have permission to view department users"));
        }

        const { id } = request.params;
        if (!id || isNaN(id)) {
            return callBack(resultObject(false, "Invalid department ID provided"));
        }

        // Check if department exists
        const department = await getDepartmentByIdModel(id);
        if (!department) {
            return callBack(resultObject(false, "Department not found"));
        }

        const options = {
            page: request.query.page || 1,
            limit: request.query.limit || 10,
            status: request.query.status || "",
        };

        const result = await getDepartmentUsersModel(id, options);

        callBack(
            resultObject(true, "Department users retrieved successfully", {
                department: {
                    id: department.id,
                    name: department.name,
                },
                users: result.data,
                pagination: result.pagination,
            })
        );
    } catch (error) {
        console.error("Error in getDepartmentUsers:", error);
        if (error instanceof CustomError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

/**
 * Get department statistics
 * Only admin and management can view department statistics
 */
const getDepartmentStats = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Only admin and management can view statistics
        if (!hasPermission(authorize.department_id, "analytics", "read")) {
            return callBack(resultObject(false, "You don't have permission to view department statistics"));
        }

        const result = await getDepartmentStatsModel();

        callBack(resultObject(true, "Department statistics retrieved successfully", result));
    } catch (error) {
        console.error("Error in getDepartmentStats:", error);
        if (error instanceof CustomError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

/**
 * Get departments for dropdown/selection
 * Simplified endpoint for UI dropdowns - all authenticated users
 */
const getDepartmentsForSelection = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Simple query for dropdown options
        const departments = await getDepartmentsModel({
            query: {
                limit: 100, // Get all departments for selection
                sort_by: "name",
                sort_order: "ASC",
            },
        });

        // Return simplified format for dropdowns
        const options = departments.data.map((dept) => ({
            id: dept.id,
            name: dept.name,
            value: dept.id,
            label: dept.name,
        }));

        callBack(resultObject(true, "Department options retrieved successfully", options));
    } catch (error) {
        console.error("Error in getDepartmentsForSelection:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

module.exports = {
    getDepartmentsController: getDepartments,
    getDepartmentByIdController: getDepartmentById,
    createDepartmentController: createDepartment,
    updateDepartmentController: updateDepartment,
    deleteDepartmentController: deleteDepartment,
    getDepartmentUsersController: getDepartmentUsers,
    getDepartmentStatsController: getDepartmentStats,
    getDepartmentsForSelectionController: getDepartmentsForSelection,
};
