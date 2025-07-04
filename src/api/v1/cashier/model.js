// src/api/v1/cashier/model.js

const { executeQuery, executeTransaction } = require("../../../helpers/db");
const { CustomError } = require("../../../middleware/errorHandler");

/**
 * Get tables with active bills
 * @param {Object} req - Request object
 * @returns {Promise<Array>} - Array of tables with active bills
 */
const getTablesWithActiveBillsModel = async (req) => {
    try {
        const { restaurant_id } = req.params;

        // Use restaurant_id from the authenticated user if not specified
        const actualRestaurantId = restaurant_id || req.user?.restaurant_id;

        if (!actualRestaurantId) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        const sql = `
            SELECT 
                t.id as table_id,
                t.number as table_number,
                COUNT(DISTINCT o.id) as active_orders_count,
                SUM(i.price * oi.quantity) as total_amount,
                MAX(o.created_at) as latest_order_time,
                MIN(o.created_at) as first_order_time
            FROM 
                tables t
            JOIN 
                orders o ON t.id = o.table_id
            JOIN 
                order_items oi ON o.id = oi.order_id
            JOIN 
                items i ON oi.item_id = i.id
            LEFT JOIN 
                invoices inv ON o.id = inv.order_id
            WHERE 
                t.restaurant_id = ?
            AND 
                o.status_id >= 4 -- Ready or served
            AND 
                inv.id IS NULL -- Not invoiced yet
            GROUP BY 
                t.id, t.number
            ORDER BY 
                first_order_time ASC
        `;

        return await executeQuery(sql, [actualRestaurantId], "getTablesWithActiveBillsModel");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Get orders ready for billing
 * @param {Object} req - Request object
 * @returns {Promise<Array>} - Array of orders ready for billing
 */
const getOrdersForBillingModel = async (req) => {
    try {
        const { table_id } = req.params;

        if (!table_id) {
            throw new CustomError("Table ID is required", 400);
        }

        const sql = `
            SELECT 
                o.id as order_id,
                o.created_at,
                o.table_id,
                t.number as table_number,
                os.name as status_name,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', oi.id,
                            'item_id', oi.item_id,
                            'item_name', i.name,
                            'quantity', oi.quantity,
                            'unit_price', i.price,
                            'total_price', i.price * oi.quantity,
                            'special_instructions', oi.special_instructions
                        )
                    )
                    FROM order_items oi
                    JOIN items i ON oi.item_id = i.id
                    WHERE oi.order_id = o.id
                ) as items,
                COALESCE(
                    (SELECT SUM(i.price * oi.quantity)
                    FROM order_items oi
                    JOIN items i ON oi.item_id = i.id
                    WHERE oi.order_id = o.id), 0
                ) as order_total
            FROM 
                orders o
            JOIN 
                tables t ON o.table_id = t.id
            JOIN 
                order_statuses os ON o.status_id = os.id
            LEFT JOIN 
                invoices inv ON o.id = inv.order_id
            WHERE 
                o.table_id = ?
            AND 
                o.status_id >= 4 -- Ready or served
            AND 
                inv.id IS NULL -- Not invoiced yet
            AND 
                o.deleted_at IS NULL
            ORDER BY 
                o.created_at ASC
        `;

        return await executeQuery(sql, [table_id], "getOrdersForBillingModel");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Get available discounts
 * @param {Object} req - Request object
 * @returns {Promise<Array>} - Array of available discounts
 */
const getAvailableDiscountsModel = async (req) => {
    try {
        const { restaurant_id } = req.params;

        // Use restaurant_id from the authenticated user if not specified
        const actualRestaurantId = restaurant_id || req.user?.restaurant_id;

        if (!actualRestaurantId) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        const sql = `
            SELECT 
                d.id,
                d.name,
                d.description,
                d.discount_type,
                d.discount_value,
                d.applies_to,
                d.target_id,
                d.min_order_value,
                d.active,
                d.starts_at,
                d.ends_at
            FROM 
                discounts d
            WHERE 
                d.restaurant_id = ?
            AND 
                d.active = 1
            AND 
                (d.starts_at IS NULL OR d.starts_at <= NOW())
            AND 
                (d.ends_at IS NULL OR d.ends_at >= NOW())
            ORDER BY 
                d.discount_value DESC, d.name ASC
        `;

        return await executeQuery(sql, [actualRestaurantId], "getAvailableDiscountsModel");
    } catch (error) {
        throw new CustomError(error.message, 500);
    }
};

/**
 * Create invoice for orders
 * @param {Object} data - Invoice data
 * @returns {Promise<Object>} - Created invoice
 */
const createInvoiceModel = async (data) => {
    try {
        const { order_ids, discount_id, payment_method_id, payment_status_id, notes, user_id } = data;

        if (!order_ids || !order_ids.length) {
            throw new CustomError("At least one order ID is required", 400);
        }

        // Get orders information first
        const ordersQuery = `
            SELECT 
                o.id as order_id,
                o.table_id,
                o.restaurant_id,
                COALESCE(
                    (SELECT SUM(i.price * oi.quantity)
                    FROM order_items oi
                    JOIN items i ON oi.item_id = i.id
                    WHERE oi.order_id = o.id), 0
                ) as order_total
            FROM 
                orders o
            WHERE 
                o.id IN (?)
            AND 
                o.deleted_at IS NULL
        `;

        const orders = await executeQuery(ordersQuery, [order_ids], "getOrdersForInvoice");

        if (!orders || orders.length === 0) {
            throw new CustomError("No valid orders found", 404);
        }

        // Check if all orders are from the same table and restaurant
        const tableId = orders[0].table_id;
        const restaurantId = orders[0].restaurant_id;

        if (!orders.every((o) => o.table_id === tableId && o.restaurant_id === restaurantId)) {
            throw new CustomError("All orders must be from the same table and restaurant", 400);
        }

        // Calculate subtotal
        const subtotal = orders.reduce((total, order) => total + parseFloat(order.order_total), 0);

        // Calculate discount if applicable
        let discountAmount = 0;

        if (discount_id) {
            const discountQuery = `
                SELECT 
                    d.id,
                    d.discount_type,
                    d.discount_value,
                    d.applies_to,
                    d.target_id,
                    d.min_order_value
                FROM 
                    discounts d
                WHERE 
                    d.id = ?
                AND 
                    d.active = 1
                AND 
                    (d.starts_at IS NULL OR d.starts_at <= NOW())
                AND 
                    (d.ends_at IS NULL OR d.ends_at >= NOW())
            `;

            const discounts = await executeQuery(discountQuery, [discount_id], "getDiscountForInvoice");

            if (discounts && discounts.length > 0) {
                const discount = discounts[0];

                // Check minimum order value
                if (discount.min_order_value && subtotal < discount.min_order_value) {
                    throw new CustomError(
                        `Minimum order value of ${discount.min_order_value} not met for this discount`,
                        400
                    );
                }

                // Calculate discount amount
                if (discount.discount_type === "percentage") {
                    discountAmount = subtotal * (discount.discount_value / 100);
                } else {
                    // fixed amount
                    discountAmount = discount.discount_value;
                }

                // Don't allow discount to exceed subtotal
                if (discountAmount > subtotal) {
                    discountAmount = subtotal;
                }
            }
        }

        // Calculate total
        const totalAmount = subtotal - discountAmount;

        // Start transaction
        const queries = [];

        // Create invoice
        queries.push({
            sql: `
                INSERT INTO invoices (
                    restaurant_id,
                    table_id,
                    subtotal,
                    discount,
                    total_amount,
                    notes,
                    created_by,
                    created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
            `,
            params: [restaurantId, tableId, subtotal, discountAmount, totalAmount, notes, user_id],
        });

        // Link orders to invoice
        for (const orderId of order_ids) {
            queries.push({
                sql: `
                    UPDATE orders
                    SET 
                        invoice_id = LAST_INSERT_ID(),
                        status_id = 7, -- Completed
                        updated_by = ?,
                        updated_at = NOW()
                    WHERE id = ?
                `,
                params: [user_id, orderId],
            });

            // Record status change in history
            queries.push({
                sql: `
                    INSERT INTO order_status_history
                    (order_id, status_id, changed_by, notes, created_at)
                    VALUES (?, 7, ?, 'Order completed and invoiced', NOW())
                `,
                params: [orderId, user_id],
            });
        }

        // Add discount to invoice if applicable
        if (discount_id && discountAmount > 0) {
            queries.push({
                sql: `
                    INSERT INTO invoice_discounts
                    (invoice_id, discount_id, discount_amount)
                    VALUES (LAST_INSERT_ID(), ?, ?)
                `,
                params: [discount_id, discountAmount],
            });
        }

        // Create payment record
        queries.push({
            sql: `
                INSERT INTO payments
                (invoice_id, payment_status_id, payment_method, amount, created_by, created_at)
                VALUES (LAST_INSERT_ID(), ?, ?, ?, ?, NOW())
            `,
            params: [payment_status_id, payment_method_id, totalAmount, user_id],
        });

        // Execute transaction
        const result = await executeTransaction(queries, "createInvoice");
        const invoiceId = result[0].insertId;

        const invoiceQuery = `
            SELECT 
                i.id,
                i.restaurant_id,
                i.table_id,
                t.number as table_number,
                i.subtotal,
                i.discount,
                i.total_amount,
                i.notes,
                i.created_at,
                u.name as created_by_name,
                p.id as payment_id,
                p.payment_method,
                ps.name as payment_status
            FROM 
                invoices i
            JOIN 
                tables t ON i.table_id = t.id
            JOIN 
                users u ON i.created_by = u.id
            LEFT JOIN 
                payments p ON i.id = p.invoice_id
            LEFT JOIN 
                payment_statuses ps ON p.payment_status_id = ps.id
            WHERE 
                i.id = ?
        `;

        const invoiceDetails = await executeQuery(invoiceQuery, [invoiceId], "getInvoiceDetails");

        if (!invoiceDetails || invoiceDetails.length === 0) {
            throw new CustomError("Failed to retrieve invoice details", 500);
        }

        // Get table information from the orders
        const tableInfoQuery = `
            SELECT DISTINCT o.table_id, o.restaurant_id, t.number
            FROM orders o
            JOIN tables t ON o.table_id = t.id
            WHERE o.id IN (?)
        `;
        const tableInfo = await executeQuery(tableInfoQuery, [order_ids], "getTableInfoForSessionEnd");

        if (tableInfo && tableInfo.length > 0) {
            const { table_id, restaurant_id, number } = tableInfo[0];

            // 1. Clear all cart sessions for this table
            const clearSessionsQuery = `
                DELETE FROM cart_items 
                WHERE cart_id IN (SELECT id FROM carts WHERE table_id = ? AND restaurant_id = ?)
            `;
            await executeQuery(clearSessionsQuery, [table_id, restaurant_id], "clearCartItems");

            const clearCartsQuery = `
                DELETE FROM carts 
                WHERE table_id = ? AND restaurant_id = ?
            `;
            await executeQuery(clearCartsQuery, [table_id, restaurant_id], "clearCarts");

            // 2. Reset table status to available
            const resetTableQuery = `
                UPDATE tables 
                SET status = 'available', 
                    customer_count = 0, 
                    updated_at = CURRENT_TIMESTAMP,
                    updated_by = ?
                WHERE id = ? AND restaurant_id = ?
            `;
            await executeQuery(resetTableQuery, [user_id, table_id, restaurant_id], "resetTableAfterCheckout");

            console.log(`✅ Session ended for Table ${number} after checkout`);
        }

        return invoiceDetails[0];
    } catch (error) {
        throw new CustomError(error.message, error.statusCode || 500);
    }
};

/**
 * Get invoice details
 * @param {Object} req - Request object
 * @returns {Promise<Object>} - Invoice details
 */
const getInvoiceDetailsModel = async (req) => {
    try {
        const { invoice_id } = req.params;

        if (!invoice_id) {
            throw new CustomError("Invoice ID is required", 400);
        }

        // Get invoice header
        const invoiceQuery = `
            SELECT 
                i.id,
                i.restaurant_id,
                i.table_id,
                t.number as table_number,
                i.subtotal,
                i.discount,
                i.total_amount,
                i.notes,
                i.created_at,
                u.name as created_by_name,
                p.id as payment_id,
                p.payment_method,
                pm.name as payment_method_name,
                ps.name as payment_status,
                r.name as restaurant_name,
                r.tagline as restaurant_tagline
            FROM 
                invoices i
            JOIN 
                tables t ON i.table_id = t.id
            JOIN 
                users u ON i.created_by = u.id
            JOIN
                restaurants r ON i.restaurant_id = r.id
            LEFT JOIN 
                payments p ON i.id = p.invoice_id
            LEFT JOIN 
                payment_methods pm ON p.payment_method = pm.id
            LEFT JOIN 
                payment_statuses ps ON p.payment_status_id = ps.id
            WHERE 
                i.id = ?
        `;

        const invoiceHeader = await executeQuery(invoiceQuery, [invoice_id], "getInvoiceHeader");

        if (!invoiceHeader || invoiceHeader.length === 0) {
            throw new CustomError("Invoice not found", 404);
        }

        // Get orders included in this invoice
        const ordersQuery = `
            SELECT 
                o.id as order_id,
                o.created_at,
                (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', oi.id,
                            'item_id', oi.item_id,
                            'item_name', i.name,
                            'quantity', oi.quantity,
                            'unit_price', i.price,
                            'total_price', i.price * oi.quantity,
                            'special_instructions', oi.special_instructions
                        )
                    )
                    FROM order_items oi
                    JOIN items i ON oi.item_id = i.id
                    WHERE oi.order_id = o.id
                ) as items
            FROM 
                orders o
            WHERE 
                o.invoice_id = ?
            AND 
                o.deleted_at IS NULL
            ORDER BY 
                o.created_at ASC
        `;

        const orders = await executeQuery(ordersQuery, [invoice_id], "getInvoiceOrders");

        // Get discounts applied to this invoice
        const discountsQuery = `
            SELECT 
                id.invoice_id,
                id.discount_id,
                id.discount_amount,
                d.name as discount_name,
                d.description as discount_description,
                d.discount_type,
                d.discount_value
            FROM 
                invoice_discounts id
            JOIN 
                discounts d ON id.discount_id = d.id
            WHERE 
                id.invoice_id = ?
        `;

        const discounts = await executeQuery(discountsQuery, [invoice_id], "getInvoiceDiscounts");

        // Combine all data
        return {
            ...invoiceHeader[0],
            orders: orders,
            discounts: discounts,
        };
    } catch (error) {
        throw new CustomError(error.message, error.statusCode || 500);
    }
};

/**
 * Generate receipt PDF
 * @param {Object} req - Request object
 * @returns {Promise<Object>} - Receipt info
 */
const generateReceiptPdfModel = async (req) => {
    try {
        const { invoice_id } = req.params;

        if (!invoice_id) {
            throw new CustomError("Invoice ID is required", 400);
        }

        // Check if receipt already exists
        const receiptQuery = `
            SELECT 
                r.id,
                r.receipt_number,
                r.receipt_pdf
            FROM 
                receipts r
            WHERE 
                r.invoice_id = ?
        `;

        const existingReceipt = await executeQuery(receiptQuery, [invoice_id], "checkExistingReceipt");

        if (existingReceipt && existingReceipt.length > 0) {
            return existingReceipt[0];
        }

        // Get invoice details to generate receipt
        const invoiceDetails = await getInvoiceDetailsModel({ params: { invoice_id } });

        if (!invoiceDetails) {
            throw new CustomError("Failed to get invoice details", 500);
        }

        // Generate receipt number
        const receiptNumber = `REC-${invoiceDetails.restaurant_id}-${Date.now()}`;

        // In a real implementation, you would generate a PDF here
        // For this example, we'll just store the receipt number
        const createReceiptQuery = `
            INSERT INTO receipts (
                invoice_id,
                receipt_number,
                total_amount,
                payment_id,
                generated_at,
                generated_by,
                receipt_pdf
            ) VALUES (
                ?,
                ?,
                ?,
                ?,
                NOW(),
                ?,
                ?
            )
        `;

        const placeholderPdfPath = `/receipts/${receiptNumber}.pdf`;

        await executeQuery(
            createReceiptQuery,
            [
                invoice_id,
                receiptNumber,
                invoiceDetails.total_amount,
                invoiceDetails.payment_id,
                req.user.id,
                placeholderPdfPath,
            ],
            "createReceipt"
        );

        return {
            receipt_number: receiptNumber,
            receipt_pdf: placeholderPdfPath,
        };
    } catch (error) {
        throw new CustomError(error.message, error.statusCode || 500);
    }
};

/**
 * Get cashier sales report
 * @param {Object} req - Request object
 * @returns {Promise<Object>} - Sales report
 */
const getCashierReportModel = async (req) => {
    try {
        const { restaurant_id, date } = req.query;

        // Use restaurant_id from the authenticated user if not specified
        const actualRestaurantId = restaurant_id || req.user?.restaurant_id;

        if (!actualRestaurantId) {
            throw new CustomError("Restaurant ID is required", 400);
        }

        // Use today's date if not specified
        const reportDate = date || new Date().toISOString().split("T")[0];

        // Get sales summary for the day
        const summaryQuery = `
            SELECT 
                COUNT(i.id) as total_invoices,
                SUM(i.subtotal) as total_sales_before_discount,
                SUM(i.discount) as total_discounts,
                SUM(i.total_amount) as total_sales,
                COUNT(DISTINCT i.table_id) as total_tables_served
            FROM 
                invoices i
            WHERE 
                i.restaurant_id = ?
            AND 
                DATE(i.created_at) = ?
        `;

        const summary = await executeQuery(summaryQuery, [actualRestaurantId, reportDate], "getCashierReportSummary");

        // Get payment method breakdown
        const paymentMethodsQuery = `
            SELECT 
                pm.name as payment_method,
                COUNT(p.id) as count,
                SUM(p.amount) as total_amount
            FROM 
                payments p
            JOIN 
                invoices i ON p.invoice_id = i.id
            JOIN
                payment_methods pm ON p.payment_method = pm.id
            WHERE 
                i.restaurant_id = ?
            AND 
                DATE(p.created_at) = ?
            GROUP BY 
                p.payment_method
            ORDER BY 
                total_amount DESC
        `;

        const paymentMethods = await executeQuery(
            paymentMethodsQuery,
            [actualRestaurantId, reportDate],
            "getCashierReportPaymentMethods"
        );

        // Get hourly sales breakdown
        const hourlyQuery = `
            SELECT 
                HOUR(i.created_at) as hour,
                COUNT(i.id) as invoice_count,
                SUM(i.total_amount) as total_amount
            FROM 
                invoices i
            WHERE 
                i.restaurant_id = ?
            AND 
                DATE(i.created_at) = ?
            GROUP BY 
                HOUR(i.created_at)
            ORDER BY 
                hour ASC
        `;

        const hourlySales = await executeQuery(
            hourlyQuery,
            [actualRestaurantId, reportDate],
            "getCashierReportHourlySales"
        );

        // Get top selling items
        const topItemsQuery = `
            SELECT 
                i.id as item_id,
                i.name as item_name,
                SUM(oi.quantity) as quantity_sold,
                SUM(i.price * oi.quantity) as total_sales
            FROM 
                order_items oi
            JOIN 
                items i ON oi.item_id = i.id
            JOIN 
                orders o ON oi.order_id = o.id
            JOIN 
                invoices inv ON o.invoice_id = inv.id
            WHERE 
                inv.restaurant_id = ?
            AND 
                DATE(inv.created_at) = ?
            GROUP BY 
                i.id, i.name
            ORDER BY 
                quantity_sold DESC
            LIMIT 10
        `;

        const topItems = await executeQuery(
            topItemsQuery,
            [actualRestaurantId, reportDate],
            "getCashierReportTopItems"
        );

        return {
            date: reportDate,
            summary: summary[0],
            payment_methods: paymentMethods,
            hourly_sales: hourlySales,
            top_items: topItems,
        };
    } catch (error) {
        throw new CustomError(error.message, error.statusCode || 500);
    }
};

module.exports = {
    getTablesWithActiveBillsModel,
    getOrdersForBillingModel,
    getAvailableDiscountsModel,
    createInvoiceModel,
    getInvoiceDetailsModel,
    generateReceiptPdfModel,
    getCashierReportModel,
};
