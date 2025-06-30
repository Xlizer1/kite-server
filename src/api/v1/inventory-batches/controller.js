const {
    getInventoryBatchesModel,
    getInventoryBatchesByInventoryIdModel,
    createInventoryBatchModel,
    updateInventoryBatchModel,
    consumeFromBatchesModel,
    getBatchMovementsModel,
    getExpiringBatchesModel,
} = require("./model");
const { resultObject, verifyUserToken, getToken } = require("../../../helpers/common");
const { CustomError } = require("../../../middleware/errorHandler");

const getInventoryBatches = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1) && authorize?.department_id !== 2 && authorize?.department_id !== 4) {
            throw new CustomError("You don't have permission to view inventory batches!", 403);
        }

        const result = await getInventoryBatchesModel(request, authorize);
        callBack(resultObject(true, "Inventory batches retrieved successfully", result));
    } catch (error) {
        console.error("Error in getInventoryBatches:", error);
        callBack(
            resultObject(
                false,
                error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
                null,
                error instanceof CustomError ? error.statusCode : 500
            )
        );
    }
};

const getInventoryBatchesByInventoryId = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1) && authorize?.department_id !== 2 && authorize?.department_id !== 4) {
            throw new CustomError("You don't have permission to view inventory batches!", 403);
        }

        const { inventory_id } = request.params;
        if (!inventory_id) {
            throw new CustomError("Inventory ID is required", 400);
        }

        const result = await getInventoryBatchesByInventoryIdModel(inventory_id, authorize);
        callBack(resultObject(true, "Inventory batches retrieved successfully", result));
    } catch (error) {
        console.error("Error in getInventoryBatchesByInventoryId:", error);
        callBack(
            resultObject(
                false,
                error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
                null,
                error instanceof CustomError ? error.statusCode : 500
            )
        );
    }
};

const createInventoryBatch = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1) && authorize?.department_id !== 2 && authorize?.department_id !== 4) {
            throw new CustomError("You don't have permission to create inventory batches!", 403);
        }

        const {
            inventory_id,
            batch_number,
            initial_quantity,
            unit_id,
            purchase_price,
            selling_price,
            currency_id,
            supplier_id,
            purchase_date,
            expiry_date,
            manufacturing_date,
            lot_number,
            notes,
        } = request.body;

        // Validate required fields
        if (!inventory_id || !batch_number || !initial_quantity || !unit_id) {
            throw new CustomError(
                "Missing required fields: inventory_id, batch_number, initial_quantity, unit_id",
                400
            );
        }

        // Validate numeric fields
        if (isNaN(initial_quantity) || initial_quantity <= 0) {
            throw new CustomError("Initial quantity must be a positive number", 400);
        }

        if (purchase_price && (isNaN(purchase_price) || purchase_price < 0)) {
            throw new CustomError("Purchase price must be a non-negative number", 400);
        }

        if (selling_price && (isNaN(selling_price) || selling_price < 0)) {
            throw new CustomError("Selling price must be a non-negative number", 400);
        }

        // Validate dates
        if (expiry_date && new Date(expiry_date) <= new Date()) {
            throw new CustomError("Expiry date must be in the future", 400);
        }

        if (manufacturing_date && new Date(manufacturing_date) > new Date()) {
            throw new CustomError("Manufacturing date cannot be in the future", 400);
        }

        const batchData = {
            inventory_id,
            batch_number,
            initial_quantity: parseFloat(initial_quantity),
            unit_id,
            purchase_price: purchase_price ? parseFloat(purchase_price) : null,
            selling_price: selling_price ? parseFloat(selling_price) : null,
            currency_id: currency_id || null,
            supplier_id: supplier_id || null,
            purchase_date: purchase_date || null,
            expiry_date: expiry_date || null,
            manufacturing_date: manufacturing_date || null,
            lot_number: lot_number || null,
            notes: notes || null,
            created_by: authorize.id,
        };

        await createInventoryBatchModel(batchData);
        callBack(resultObject(true, "Inventory batch created successfully"));
    } catch (error) {
        console.error("Error in createInventoryBatch:", error);
        callBack(
            resultObject(
                false,
                error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
                null,
                error instanceof CustomError ? error.statusCode : 500
            )
        );
    }
};

const updateInventoryBatch = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1) && authorize?.department_id !== 2 && authorize?.department_id !== 4) {
            throw new CustomError("You don't have permission to update inventory batches!", 403);
        }

        const { id } = request.params;
        if (!id) {
            throw new CustomError("Batch ID is required", 400);
        }

        const { notes, selling_price, status } = request.body;

        // Validate selling price if provided
        if (selling_price && (isNaN(selling_price) || selling_price < 0)) {
            throw new CustomError("Selling price must be a non-negative number", 400);
        }

        // Validate status if provided
        const validStatuses = ["active", "expired", "consumed", "damaged"];
        if (status && !validStatuses.includes(status)) {
            throw new CustomError(`Status must be one of: ${validStatuses.join(", ")}`, 400);
        }

        const updateData = {
            notes,
            selling_price: selling_price ? parseFloat(selling_price) : undefined,
            status,
            updated_by: authorize.id,
        };

        await updateInventoryBatchModel(id, updateData, authorize);
        callBack(resultObject(true, "Inventory batch updated successfully"));
    } catch (error) {
        console.error("Error in updateInventoryBatch:", error);
        callBack(
            resultObject(
                false,
                error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
                null,
                error instanceof CustomError ? error.statusCode : 500
            )
        );
    }
};

const consumeFromBatches = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (
            !authorize?.roles?.includes(1) &&
            authorize?.department_id !== 2 &&
            authorize?.department_id !== 4 &&
            authorize?.department_id !== 6
        ) {
            throw new CustomError("You don't have permission to consume inventory!", 403);
        }

        const { inventory_id, quantity, reference_type, reference_id, notes } = request.body;

        // Validate required fields
        if (!inventory_id || !quantity) {
            throw new CustomError("Missing required fields: inventory_id, quantity", 400);
        }

        // Validate numeric fields
        if (isNaN(quantity) || quantity <= 0) {
            throw new CustomError("Quantity must be a positive number", 400);
        }

        // Validate reference type
        const validReferenceTypes = ["order", "manual", "system"];
        if (reference_type && !validReferenceTypes.includes(reference_type)) {
            throw new CustomError(`Reference type must be one of: ${validReferenceTypes.join(", ")}`, 400);
        }

        const result = await consumeFromBatchesModel(
            inventory_id,
            parseFloat(quantity),
            reference_type || "manual",
            reference_id || null,
            authorize.id
        );

        callBack(resultObject(true, "Inventory consumed successfully", result));
    } catch (error) {
        console.error("Error in consumeFromBatches:", error);
        callBack(
            resultObject(
                false,
                error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
                null,
                error instanceof CustomError ? error.statusCode : 500
            )
        );
    }
};

const getBatchMovements = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1) && authorize?.department_id !== 2 && authorize?.department_id !== 4) {
            throw new CustomError("You don't have permission to view batch movements!", 403);
        }

        const { id } = request.params;
        if (!id) {
            throw new CustomError("Batch ID is required", 400);
        }

        const result = await getBatchMovementsModel(id);
        callBack(resultObject(true, "Batch movements retrieved successfully", result));
    } catch (error) {
        console.error("Error in getBatchMovements:", error);
        callBack(
            resultObject(
                false,
                error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
                null,
                error instanceof CustomError ? error.statusCode : 500
            )
        );
    }
};

const getExpiringBatches = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1) && authorize?.department_id !== 2 && authorize?.department_id !== 4) {
            throw new CustomError("You don't have permission to view expiring batches!", 403);
        }

        const { days_ahead = 7 } = request.query;
        const restaurantId = authorize.restaurant_id || request.query.restaurant_id;

        if (!restaurantId) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        const result = await getExpiringBatchesModel(restaurantId, parseInt(days_ahead));
        callBack(resultObject(true, "Expiring batches retrieved successfully", result));
    } catch (error) {
        console.error("Error in getExpiringBatches:", error);
        callBack(
            resultObject(
                false,
                error instanceof CustomError ? error.message : "Something went wrong. Please try again later.",
                null,
                error instanceof CustomError ? error.statusCode : 500
            )
        );
    }
};

module.exports = {
    getInventoryBatchesController: getInventoryBatches,
    getInventoryBatchesByInventoryIdController: getInventoryBatchesByInventoryId,
    createInventoryBatchController: createInventoryBatch,
    updateInventoryBatchController: updateInventoryBatch,
    consumeFromBatchesController: consumeFromBatches,
    getBatchMovementsController: getBatchMovements,
    getExpiringBatchesController: getExpiringBatches,
};
