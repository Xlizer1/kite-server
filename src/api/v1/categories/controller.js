const {
    getCategoriesModel,
    getCategoryByIdModel,
    createRestaurantCategoryModel,
    updateCategoryModel,
    deleteCategoryModel,
    updateCategoryImageModel,
    bulkDeleteCategoriesModel,
    exportCategoriesModel,
    getCategoryStatisticsModel,
    createUserActivityLogModel,
    getRestaurantCategoryModel, // Added for backward compatibility
} = require("./model");

const { resultObject, verifyUserToken, getToken } = require("../../../helpers/common");
const { hasPermission, isAdmin, isManagement, DEPARTMENTS } = require("../../../helpers/permissions");
const { ValidationError, CustomError } = require("../../../middleware/errorHandler");

/**
 * Get all categories with pagination and filtering
 */
const getCategories = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user can read categories
        if (!hasPermission(authorize.department_id, "categories", "read")) {
            return callBack(resultObject(false, "You don't have permission to view categories!"));
        }

        const result = await getCategoriesModel(request, authorize);

        if (result && result.data && Array.isArray(result.data)) {
            callBack(resultObject(true, "Categories retrieved successfully", result));
        } else if (result && result.data && result.data.length === 0) {
            callBack(
                resultObject(true, "No categories found", {
                    data: [],
                    pagination: result.pagination,
                    filters: result.filters,
                })
            );
        } else {
            callBack(resultObject(false, "Failed to retrieve categories"));
        }
    } catch (error) {
        console.error("Error in getCategories:", error);
        if (error instanceof ValidationError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

/**
 * Get categories for selection (dropdown)
 */
const getCategoriesForSelection = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user can read categories
        if (!hasPermission(authorize.department_id, "categories", "read")) {
            return callBack(resultObject(false, "You don't have permission to view categories!"));
        }

        // Use user's restaurant_id by default
        const restaurant_id = request.query.restaurant_id || authorize.restaurant_id;

        if (!restaurant_id) {
            return callBack(resultObject(true, "No restaurant specified", []));
        }

        // Create a modified request for simple selection
        const selectionRequest = {
            query: {
                restaurant_id,
                limit: 100,
                sort_by: "name",
                sort_order: "ASC",
            },
        };

        const result = await getCategoriesModel(selectionRequest, authorize);

        // Return simplified format for dropdowns
        const options = result.data.map((category) => ({
            id: category.id,
            name: category.name,
            value: category.id,
            label: category.name,
            image_url: category.image_url,
        }));

        callBack(resultObject(true, "Category options retrieved successfully", options));
    } catch (error) {
        console.error("Error in getCategoriesForSelection:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

/**
 * Get category by ID
 */
const getCategoryById = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user can read categories
        if (!hasPermission(authorize.department_id, "categories", "read")) {
            return callBack(resultObject(false, "You don't have permission to view this category!"));
        }

        const { id } = request.params;
        if (!id || isNaN(id)) {
            throw new ValidationError("Invalid category ID provided.");
        }

        const category = await getCategoryByIdModel(id, authorize);

        if (category && category?.id) {
            callBack(resultObject(true, "Category retrieved successfully", category));
        } else {
            throw new ValidationError("Category doesn't exist.");
        }
    } catch (error) {
        console.error("Error in getCategoryById:", error);
        if (error instanceof ValidationError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

/**
 * Create new category
 */
const createRestaurantCategory = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user can create categories
        if (!hasPermission(authorize.department_id, "categories", "create")) {
            return callBack(resultObject(false, "You don't have permission to create categories!"));
        }

        const { name, restaurant_id } = request.body;
        const image = request.file;

        // Validate restaurant access for non-admin users
        if (authorize.department_id === DEPARTMENTS.RESTAURANT_ADMIN && authorize.restaurant_id !== restaurant_id) {
            return callBack(resultObject(false, "You can only create categories for your restaurant!"));
        }

        // Validate required fields
        if (!name) {
            return callBack(resultObject(false, "Category name is required"));
        }

        const finalRestaurantId = restaurant_id || authorize.restaurant_id;
        if (!finalRestaurantId) {
            return callBack(resultObject(false, "Restaurant ID is required"));
        }

        const result = await createRestaurantCategoryModel(name.trim(), finalRestaurantId, image, authorize.id);

        if (result?.status) {
            // Log category creation
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "category_created",
                description: `Created new category: ${name.trim()}`,
                metadata: JSON.stringify({ restaurant_id: finalRestaurantId, name }),
            });

            callBack(resultObject(true, "Category created successfully", result.category));
        } else {
            callBack(resultObject(false, result?.message || "Failed to create category"));
        }
    } catch (error) {
        console.error("Error in createRestaurantCategory:", error);
        if (error instanceof CustomError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

/**
 * Update category
 */
const updateCategory = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user can update categories
        if (!hasPermission(authorize.department_id, "categories", "update")) {
            return callBack(resultObject(false, "You don't have permission to update categories!"));
        }

        const { id } = request.params;
        const { name } = request.body;

        if (!name || !name.trim()) {
            return callBack(resultObject(false, "Category name is required"));
        }

        // Get existing category to verify ownership for restaurant admins
        if (authorize.department_id === DEPARTMENTS.RESTAURANT_ADMIN) {
            const existingCategory = await getCategoryByIdModel(id, authorize);
            if (!existingCategory || existingCategory.restaurant_id !== authorize.restaurant_id) {
                return callBack(resultObject(false, "You can only update categories in your restaurant!"));
            }
        }

        const result = await updateCategoryModel(id, name.trim(), authorize.id);

        if (result?.status) {
            // Log category update
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "category_updated",
                description: `Updated category ID: ${id}`,
                metadata: JSON.stringify({ category_id: id, name }),
            });

            callBack(resultObject(true, "Category updated successfully", result.category));
        } else {
            callBack(resultObject(false, "Failed to update category"));
        }
    } catch (error) {
        console.error("Error in updateCategory:", error);
        if (error instanceof CustomError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

/**
 * Delete category
 */
const deleteCategory = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user can delete categories
        if (!hasPermission(authorize.department_id, "categories", "delete")) {
            return callBack(resultObject(false, "You don't have permission to delete categories!"));
        }

        const { id } = request.params;

        // Get existing category to verify ownership for restaurant admins
        if (authorize.department_id === DEPARTMENTS.RESTAURANT_ADMIN) {
            const existingCategory = await getCategoryByIdModel(id, authorize);
            if (!existingCategory || existingCategory.restaurant_id !== authorize.restaurant_id) {
                return callBack(resultObject(false, "You can only delete categories in your restaurant!"));
            }
        }

        const result = await deleteCategoryModel(id, authorize.id);

        if (result?.status) {
            // Log category deletion
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "category_deleted",
                description: `Deleted category ID: ${id}`,
            });

            callBack(resultObject(true, "Category deleted successfully"));
        } else {
            callBack(resultObject(false, result?.message || "Failed to delete category"));
        }
    } catch (error) {
        console.error("Error in deleteCategory:", error);
        if (error instanceof CustomError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

/**
 * Update category image
 */
const updateCategoryImage = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user can update categories
        if (!hasPermission(authorize.department_id, "categories", "update")) {
            return callBack(resultObject(false, "You don't have permission to update category images!"));
        }

        const { id } = request.params;

        if (!request.file) {
            return callBack(resultObject(false, "No image file provided"));
        }

        // Get existing category to verify ownership for restaurant admins
        if (authorize.department_id === DEPARTMENTS.RESTAURANT_ADMIN) {
            const existingCategory = await getCategoryByIdModel(id, authorize);
            if (!existingCategory || existingCategory.restaurant_id !== authorize.restaurant_id) {
                return callBack(resultObject(false, "You can only update images for categories in your restaurant!"));
            }
        }

        const result = await updateCategoryImageModel(id, request.file, authorize.id);

        if (result) {
            // Log image update
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "category_image_updated",
                description: `Updated image for category ID: ${id}`,
            });

            callBack(resultObject(true, "Category image updated successfully", result));
        } else {
            callBack(resultObject(false, "Failed to update category image"));
        }
    } catch (error) {
        console.error("Error in updateCategoryImage:", error);
        if (error instanceof CustomError) {
            callBack(resultObject(false, error.message));
        } else {
            callBack(resultObject(false, "Something went wrong. Please try again later."));
        }
    }
};

/**
 * Bulk delete categories
 */
const bulkDeleteCategories = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Only admin can bulk delete
        if (!isAdmin(authorize.department_id)) {
            return callBack(resultObject(false, "Only administrators can bulk delete categories"));
        }

        const { category_ids } = request.body;

        if (!category_ids || !Array.isArray(category_ids) || category_ids.length === 0) {
            return callBack(resultObject(false, "Category IDs array is required"));
        }

        const result = await bulkDeleteCategoriesModel(category_ids, authorize.id);

        if (result.status) {
            // Log bulk deletion
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "bulk_delete_categories",
                description: `Bulk deleted ${category_ids.length} categories`,
            });

            callBack(resultObject(true, `Successfully deleted ${result.deletedCount} categories`));
        } else {
            callBack(resultObject(false, "Failed to delete categories"));
        }
    } catch (error) {
        console.error("Error in bulkDeleteCategories:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

/**
 * Export categories
 */
const exportCategories = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Only management can export
        if (!isManagement(authorize.department_id)) {
            return callBack(resultObject(false, "You don't have permission to export categories"));
        }

        const { format = "csv" } = request.query;

        const result = await exportCategoriesModel(format, authorize);

        if (result.status) {
            // Log export
            await createUserActivityLogModel({
                user_id: authorize.id,
                action: "export_categories",
                description: `Exported categories in ${format} format`,
            });

            callBack(resultObject(true, "Categories exported successfully", result.data));
        } else {
            callBack(resultObject(false, "Failed to export categories"));
        }
    } catch (error) {
        console.error("Error in exportCategories:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

/**
 * Get category statistics
 */
const getCategoryStatistics = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        // Check if user can read categories
        if (!hasPermission(authorize.department_id, "categories", "read")) {
            return callBack(resultObject(false, "You don't have permission to view category statistics"));
        }

        const restaurant_id =
            authorize.department_id === DEPARTMENTS.RESTAURANT_ADMIN
                ? authorize.restaurant_id
                : request.query.restaurant_id;

        const result = await getCategoryStatisticsModel(restaurant_id);

        if (result) {
            callBack(resultObject(true, "Category statistics retrieved successfully", result));
        } else {
            callBack(resultObject(false, "Failed to retrieve category statistics"));
        }
    } catch (error) {
        console.error("Error in getCategoryStatistics:", error);
        callBack(resultObject(false, "Something went wrong. Please try again later."));
    }
};

/**
 * Legacy function for backward compatibility with menu system
 */
const getRestaurantCategory = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.email) {
            return callBack(resultObject(false, "Token is invalid!"));
        }

        const result = await getRestaurantCategoryModel(authorize.restaurant_id);

        if (result) {
            callBack(resultObject(true, "success", result));
        } else {
            callBack(resultObject(false, "Could not get category."));
        }
    } catch (error) {
        callBack({
            status: false,
            message: "Something went wrong. Please try again later.",
        });
        console.log(error);
    }
};

module.exports = {
    // Main CRUD operations
    getCategoriesController: getCategories,
    getCategoryByIdController: getCategoryById,
    createRestaurantCategoryController: createRestaurantCategory,
    updateCategoryController: updateCategory,
    deleteCategoryController: deleteCategory,

    // Image management
    updateCategoryImageController: updateCategoryImage,

    // Utility endpoints
    getCategoriesForSelectionController: getCategoriesForSelection,
    getCategoryStatisticsController: getCategoryStatistics,

    // Bulk operations
    bulkDeleteCategoriesController: bulkDeleteCategories,

    // Export
    exportCategoriesController: exportCategories,

    // Legacy function for backward compatibility
    getRestaurantCategoryController: getRestaurantCategory,
};
