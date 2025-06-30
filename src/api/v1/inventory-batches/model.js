const { executeQuery, executeTransaction, buildInsertQuery, buildUpdateQuery } = require("../../../helpers/db");
const { DatabaseError, NotFoundError, ConflictError, BusinessLogicError } = require("../../../middleware/errorHandler");

/**
 * Get all inventory batches with filtering and pagination
 */
const getInventoryBatches = async (request, user) => {
    try {
        const {
            page = 1,
            limit = 10,
            search = "",
            inventory_id = "",
            status = "",
            expired_only = false,
            expiring_soon = false,
            sort_by = "created_at",
            sort_order = "DESC",
        } = request.query || {};

        const offset = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        const conditions = ["ib.deleted_at IS NULL"];
        const params = [];

        // Add search condition
        if (search && search.trim()) {
            conditions.push(`(
                ib.batch_number LIKE ? OR 
                inv.name LIKE ? OR
                ib.lot_number LIKE ?
            )`);
            const searchParam = `%${search.trim()}%`;
            params.push(searchParam, searchParam, searchParam);
        }

        // Add inventory filter
        if (inventory_id && inventory_id !== "") {
            conditions.push("ib.inventory_id = ?");
            params.push(parseInt(inventory_id));
        }

        // Add status filter
        if (status && status !== "") {
            conditions.push("ib.status = ?");
            params.push(status);
        }

        // Add expired filter
        if (expired_only === "true") {
            conditions.push("ib.expiry_date < CURDATE()");
        }

        // Add expiring soon filter (next 7 days)
        if (expiring_soon === "true") {
            conditions.push("ib.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)");
        }

        // Restrict to user's restaurant for restaurant admins
        if (user.department_id === 2) {
            conditions.push("inv.restaurant_id = ?");
            params.push(user.restaurant_id);
        }

        const allowedSortFields = [
            "id",
            "batch_number",
            "initial_quantity",
            "current_quantity",
            "purchase_date",
            "expiry_date",
            "created_at",
        ];
        const sortField = allowedSortFields.includes(sort_by) ? sort_by : "created_at";
        const sortDirection = sort_order.toUpperCase() === "DESC" ? "DESC" : "ASC";

        const whereClause = conditions.join(" AND ");

        const dataQuery = `
            SELECT 
                ib.id,
                ib.inventory_id,
                ib.batch_number,
                ib.initial_quantity,
                ib.current_quantity,
                ib.purchase_price,
                ib.selling_price,
                ib.purchase_date,
                ib.expiry_date,
                ib.manufacturing_date,
                ib.lot_number,
                ib.status,
                ib.notes,
                ib.created_at,
                ib.updated_at,
                inv.name AS inventory_name,
                u.name AS unit_name,
                u.unit_symbol,
                c.code AS currency_code,
                s.name AS supplier_name,
                CASE 
                    WHEN ib.expiry_date < CURDATE() THEN 'expired'
                    WHEN ib.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'expiring_soon'
                    WHEN ib.current_quantity <= 0 THEN 'consumed'
                    ELSE 'active'
                END AS alert_status,
                DATEDIFF(ib.expiry_date, CURDATE()) AS days_until_expiry,
                ROUND((ib.current_quantity / ib.initial_quantity) * 100, 2) AS usage_percentage
            FROM 
                inventory_batches ib
            LEFT JOIN inventory inv ON ib.inventory_id = inv.id
            LEFT JOIN units u ON ib.unit_id = u.id
            LEFT JOIN currencies c ON ib.currency_id = c.id
            LEFT JOIN suppliers s ON ib.supplier_id = s.id
            WHERE 
                ${whereClause}
            ORDER BY 
                ib.${sortField} ${sortDirection}
            LIMIT ? OFFSET ?
        `;

        const countQuery = `
            SELECT COUNT(ib.id) as total
            FROM 
                inventory_batches ib
            LEFT JOIN inventory inv ON ib.inventory_id = inv.id
            WHERE 
                ${whereClause}
        `;

        const dataParams = [...params, limitNum, offset];
        const countParams = [...params];

        const [result, countResult] = await Promise.all([
            executeQuery(dataQuery, dataParams, "getInventoryBatches"),
            executeQuery(countQuery, countParams, "getInventoryBatchesCount"),
        ]);

        const total = countResult[0]?.total || 0;
        const totalPages = Math.ceil(total / limitNum);

        return {
            data: result || [],
            pagination: {
                current_page: parseInt(page),
                total_pages: totalPages,
                total_records: total,
                limit: limitNum,
                has_next: parseInt(page) < totalPages,
                has_prev: parseInt(page) > 1,
            },
            filters: {
                search,
                inventory_id,
                status,
                expired_only,
                expiring_soon,
                sort_by: sortField,
                sort_order: sortDirection,
            },
        };
    } catch (error) {
        throw new DatabaseError("Failed to fetch inventory batches", error);
    }
};

/**
 * Get inventory batches by inventory ID
 */
const getInventoryBatchesByInventoryId = async (inventoryId, user) => {
    try {
        let conditions = ["ib.deleted_at IS NULL", "ib.inventory_id = ?"];
        let params = [inventoryId];

        // Restrict to user's restaurant for restaurant admins
        if (user.department_id === 2) {
            conditions.push("inv.restaurant_id = ?");
            params.push(user.restaurant_id);
        }

        const sql = `
            SELECT 
                ib.id,
                ib.batch_number,
                ib.initial_quantity,
                ib.current_quantity,
                ib.purchase_price,
                ib.selling_price,
                ib.purchase_date,
                ib.expiry_date,
                ib.lot_number,
                ib.status,
                ib.notes,
                u.name AS unit_name,
                u.unit_symbol,
                c.code AS currency_code,
                s.name AS supplier_name,
                CASE 
                    WHEN ib.expiry_date < CURDATE() THEN 'expired'
                    WHEN ib.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'expiring_soon'
                    WHEN ib.current_quantity <= 0 THEN 'consumed'
                    ELSE 'active'
                END AS alert_status,
                DATEDIFF(ib.expiry_date, CURDATE()) AS days_until_expiry
            FROM 
                inventory_batches ib
            LEFT JOIN inventory inv ON ib.inventory_id = inv.id
            LEFT JOIN units u ON ib.unit_id = u.id
            LEFT JOIN currencies c ON ib.currency_id = c.id
            LEFT JOIN suppliers s ON ib.supplier_id = s.id
            WHERE 
                ${conditions.join(" AND ")}
            ORDER BY 
                ib.purchase_date DESC, ib.created_at DESC
        `;

        const result = await executeQuery(sql, params, "getInventoryBatchesByInventoryId");
        return result;
    } catch (error) {
        throw new DatabaseError("Failed to fetch inventory batches", error);
    }
};

/**
 * Create new inventory batch
 */
const createInventoryBatch = async (batchData) => {
    try {
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
            created_by,
        } = batchData;

        // Validate if inventory item exists
        const invCheckSql = `
            SELECT id, restaurant_id FROM inventory 
            WHERE id = ? AND deleted_at IS NULL
        `;
        const invResult = await executeQuery(invCheckSql, [inventory_id], "checkInventoryItem");
        if (!invResult.length) {
            throw new NotFoundError("Inventory item not found");
        }

        // Check for duplicate batch number for this inventory item
        const duplicateCheckSql = `
            SELECT id FROM inventory_batches 
            WHERE inventory_id = ? AND batch_number = ? AND deleted_at IS NULL
        `;
        const duplicateResult = await executeQuery(
            duplicateCheckSql,
            [inventory_id, batch_number],
            "checkDuplicateBatch"
        );
        if (duplicateResult.length) {
            throw new ConflictError("A batch with this number already exists for this inventory item");
        }

        // Create batch and update inventory total
        const queries = [];

        // Insert batch
        const batchInsertData = {
            inventory_id,
            batch_number,
            initial_quantity,
            current_quantity: initial_quantity,
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
            status: "active",
            created_by,
            created_at: new Date(),
        };

        const batchQuery = buildInsertQuery("inventory_batches", batchInsertData);
        queries.push(batchQuery);

        // Update inventory total quantity
        queries.push({
            sql: `
                UPDATE inventory 
                SET quantity = quantity + ?, updated_at = NOW(), updated_by = ?
                WHERE id = ?
            `,
            params: [initial_quantity, created_by, inventory_id],
        });

        // Add stock movement record
        queries.push({
            sql: `
                INSERT INTO stock_movements (
                    item_id, movement_type_id, quantity, notes, 
                    created_by, created_at, batch_id
                )
                VALUES (?, 1, ?, ?, ?, NOW(), LAST_INSERT_ID())
            `,
            params: [inventory_id, initial_quantity, `Batch added: ${batch_number}`, created_by],
        });

        // Execute transaction
        await executeTransaction(queries, "createInventoryBatch");
        return true;
    } catch (error) {
        if (error instanceof NotFoundError || error instanceof ConflictError) {
            throw error;
        }
        throw new DatabaseError("Failed to create inventory batch", error);
    }
};

/**
 * Update inventory batch
 */
const updateInventoryBatch = async (batchId, updateData, user) => {
    try {
        const { notes, selling_price, status, updated_by } = updateData;

        // Check if batch exists and user has access
        let conditions = ["id = ?", "deleted_at IS NULL"];
        let params = [batchId];

        if (user.department_id === 2) {
            conditions.push("inventory_id IN (SELECT id FROM inventory WHERE restaurant_id = ?)");
            params.push(user.restaurant_id);
        }

        const checkSql = `
            SELECT id, current_quantity FROM inventory_batches 
            WHERE ${conditions.join(" AND ")}
        `;
        const checkResult = await executeQuery(checkSql, params, "checkInventoryBatch");
        if (!checkResult.length) {
            throw new NotFoundError("Inventory batch not found");
        }

        // Update batch
        const updateFields = {
            notes,
            selling_price,
            status,
            updated_by,
            updated_at: new Date(),
        };

        // Remove undefined values
        Object.keys(updateFields).forEach((key) => {
            if (updateFields[key] === undefined) {
                delete updateFields[key];
            }
        });

        const updateQuery = buildUpdateQuery("inventory_batches", updateFields, { id: batchId });
        await executeQuery(updateQuery.sql, updateQuery.params, "updateInventoryBatch");

        return true;
    } catch (error) {
        if (error instanceof NotFoundError) throw error;
        throw new DatabaseError("Failed to update inventory batch", error);
    }
};

/**
 * Consume quantity from batches (FIFO method)
 */
const consumeFromBatches = async (inventoryId, quantityToConsume, referenceType, referenceId, userId) => {
    try {
        // Get available batches (FIFO - oldest first)
        const batchesSql = `
            SELECT id, batch_number, current_quantity, expiry_date
            FROM inventory_batches 
            WHERE inventory_id = ? 
            AND current_quantity > 0 
            AND status = 'active'
            AND deleted_at IS NULL
            ORDER BY purchase_date ASC, created_at ASC
        `;

        const batches = await executeQuery(batchesSql, [inventoryId], "getAvailableBatches");

        if (!batches.length) {
            throw new BusinessLogicError("No available batches for consumption");
        }

        // Calculate total available quantity
        const totalAvailable = batches.reduce((sum, batch) => sum + batch.current_quantity, 0);

        if (totalAvailable < quantityToConsume) {
            throw new BusinessLogicError(
                `Insufficient stock. Available: ${totalAvailable}, Required: ${quantityToConsume}`
            );
        }

        const queries = [];
        let remainingToConsume = quantityToConsume;
        const consumedBatches = [];

        // Consume from batches (FIFO)
        for (const batch of batches) {
            if (remainingToConsume <= 0) break;

            const consumeFromThisBatch = Math.min(batch.current_quantity, remainingToConsume);
            const newQuantity = batch.current_quantity - consumeFromThisBatch;

            // Update batch quantity
            queries.push({
                sql: `
                    UPDATE inventory_batches 
                    SET current_quantity = ?, updated_at = NOW(), updated_by = ?
                    WHERE id = ?
                `,
                params: [newQuantity, userId, batch.id],
            });

            // Record batch movement
            queries.push({
                sql: `
                    INSERT INTO inventory_batch_movements (
                        batch_id, movement_type, quantity, reference_type, 
                        reference_id, notes, created_by, created_at
                    )
                    VALUES (?, 'consumption', ?, ?, ?, ?, ?, NOW())
                `,
                params: [
                    batch.id,
                    consumeFromThisBatch,
                    referenceType,
                    referenceId,
                    `Consumed ${consumeFromThisBatch} from batch ${batch.batch_number}`,
                    userId,
                ],
            });

            consumedBatches.push({
                batch_id: batch.id,
                batch_number: batch.batch_number,
                consumed_quantity: consumeFromThisBatch,
            });

            remainingToConsume -= consumeFromThisBatch;
        }

        // Update main inventory quantity
        queries.push({
            sql: `
                UPDATE inventory 
                SET quantity = quantity - ?, updated_at = NOW(), updated_by = ?
                WHERE id = ?
            `,
            params: [quantityToConsume, userId, inventoryId],
        });

        // Add main stock movement
        queries.push({
            sql: `
                INSERT INTO stock_movements (
                    item_id, movement_type_id, quantity, reference_id, 
                    notes, created_by, created_at
                )
                VALUES (?, 2, ?, ?, ?, ?, NOW())
            `,
            params: [
                inventoryId,
                -quantityToConsume,
                referenceId,
                `Consumed from ${consumedBatches.length} batches`,
                userId,
            ],
        });

        // Execute transaction
        await executeTransaction(queries, "consumeFromBatches");

        return {
            consumed_quantity: quantityToConsume,
            batches_affected: consumedBatches,
        };
    } catch (error) {
        if (error instanceof BusinessLogicError) throw error;
        throw new DatabaseError("Failed to consume from batches", error);
    }
};

/**
 * Get batch consumption history
 */
const getBatchMovements = async (batchId) => {
    try {
        const sql = `
            SELECT 
                ibm.id,
                ibm.movement_type,
                ibm.quantity,
                ibm.reference_type,
                ibm.reference_id,
                ibm.notes,
                ibm.created_at,
                u.name AS created_by_user
            FROM 
                inventory_batch_movements ibm
            LEFT JOIN users u ON ibm.created_by = u.id
            WHERE 
                ibm.batch_id = ?
            ORDER BY 
                ibm.created_at DESC
        `;

        return await executeQuery(sql, [batchId], "getBatchMovements");
    } catch (error) {
        throw new DatabaseError("Failed to fetch batch movements", error);
    }
};

/**
 * Get expiring batches alert
 */
const getExpiringBatches = async (restaurantId, daysAhead = 7) => {
    try {
        const sql = `
            SELECT 
                ib.id,
                ib.batch_number,
                ib.current_quantity,
                ib.expiry_date,
                inv.name AS inventory_name,
                u.name AS unit_name,
                DATEDIFF(ib.expiry_date, CURDATE()) AS days_until_expiry
            FROM 
                inventory_batches ib
            LEFT JOIN inventory inv ON ib.inventory_id = inv.id
            LEFT JOIN units u ON ib.unit_id = u.id
            WHERE 
                inv.restaurant_id = ?
            AND ib.current_quantity > 0
            AND ib.status = 'active'
            AND ib.expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL ? DAY)
            AND ib.deleted_at IS NULL
            ORDER BY 
                ib.expiry_date ASC
        `;

        return await executeQuery(sql, [restaurantId, daysAhead], "getExpiringBatches");
    } catch (error) {
        throw new DatabaseError("Failed to fetch expiring batches", error);
    }
};

module.exports = {
    getInventoryBatchesModel: getInventoryBatches,
    getInventoryBatchesByInventoryIdModel: getInventoryBatchesByInventoryId,
    createInventoryBatchModel: createInventoryBatch,
    updateInventoryBatchModel: updateInventoryBatch,
    consumeFromBatchesModel: consumeFromBatches,
    getBatchMovementsModel: getBatchMovements,
    getExpiringBatchesModel: getExpiringBatches,
};
