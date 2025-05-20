// src/api/v1/analytics/model.js

const { executeQuery } = require("../../../helpers/db");
const { CustomError } = require("../../../middleware/errorHandler");

/**
 * Get daily sales data for a date range
 * @param {Object} data - Query parameters
 * @returns {Promise<Array>} - Array of daily sales data
 */
const getDailySalesModel = async (data) => {
    try {
        const { restaurant_id, start_date, end_date } = data;
        
        if (!restaurant_id) {
            throw new CustomError("Restaurant ID is required", 400);
        }
        
        // Default to last 30 days if no date range provided
        const actualEndDate = end_date || new Date().toISOString().split('T')[0];
        
        const defaultStartDate = new Date();
        defaultStartDate.setDate(defaultStartDate.getDate() - 30);
        const actualStartDate = start_date || defaultStartDate.toISOString().split('T')[0];
        
        const sql = `
            SELECT 
                DATE(i.created_at) as date,
                COUNT(i.id) as invoice_count,
                SUM(i.subtotal) as subtotal,
                SUM(i.discount) as discount,
                SUM(i.total_amount) as total_sales
            FROM 
                invoices i
            WHERE 
                i.restaurant_id = ?
            AND 
                DATE(i.created_at) BETWEEN ? AND ?
            GROUP BY 
                DATE(i.created_at)
            ORDER BY 
                date ASC
        `;
        
        return await executeQuery(sql, [restaurant_id, actualStartDate, actualEndDate], "getDailySales");
    } catch (error) {
        throw new CustomError(error.message, error.statusCode || 500);
    }
};

/**
 * Get sales by category
 * @param {Object} data - Query parameters
 * @returns {Promise<Array>} - Array of category sales data
 */
const getSalesByCategoryModel = async (data) => {
    try {
        const { restaurant_id, start_date, end_date } = data;
        
        if (!restaurant_id) {
            throw new CustomError("Restaurant ID is required", 400);
        }
        
        // Default to last 30 days if no date range provided
        const actualEndDate = end_date || new Date().toISOString().split('T')[0];
        
        const defaultStartDate = new Date();
        defaultStartDate.setDate(defaultStartDate.getDate() - 30);
        const actualStartDate = start_date || defaultStartDate.toISOString().split('T')[0];
        
        const sql = `
            SELECT 
                c.id as category_id,
                c.name as category_name,
                COUNT(DISTINCT oi.id) as items_sold,
                SUM(i.price * oi.quantity) as total_sales,
                SUM(oi.quantity) as quantity_sold
            FROM 
                order_items oi
            JOIN 
                items i ON oi.item_id = i.id
            JOIN 
                sub_categories sc ON i.sub_category_id = sc.id
            JOIN 
                categories c ON sc.category_id = c.id
            JOIN 
                orders o ON oi.order_id = o.id
            JOIN 
                invoices inv ON o.invoice_id = inv.id
            WHERE 
                inv.restaurant_id = ?
            AND 
                DATE(inv.created_at) BETWEEN ? AND ?
            GROUP BY 
                c.id, c.name
            ORDER BY 
                total_sales DESC
        `;
        
        return await executeQuery(sql, [restaurant_id, actualStartDate, actualEndDate], "getSalesByCategory");
    } catch (error) {
        throw new CustomError(error.message, error.statusCode || 500);
    }
};

/**
 * Get top selling items
 * @param {Object} data - Query parameters
 * @returns {Promise<Array>} - Array of top selling items
 */
const getTopSellingItemsModel = async (data) => {
    try {
        const { restaurant_id, start_date, end_date, limit } = data;
        
        if (!restaurant_id) {
            throw new CustomError("Restaurant ID is required", 400);
        }
        
        // Default to last 30 days if no date range provided
        const actualEndDate = end_date || new Date().toISOString().split('T')[0];
        
        const defaultStartDate = new Date();
        defaultStartDate.setDate(defaultStartDate.getDate() - 30);
        const actualStartDate = start_date || defaultStartDate.toISOString().split('T')[0];
        
        const actualLimit = limit || 10; // Default to top 10
        
        const sql = `
            SELECT 
                i.id as item_id,
                i.name as item_name,
                c.name as category_name,
                sc.name as sub_category_name,
                SUM(oi.quantity) as quantity_sold,
                AVG(i.price) as average_price,
                SUM(i.price * oi.quantity) as total_sales
            FROM 
                order_items oi
            JOIN 
                items i ON oi.item_id = i.id
            JOIN 
                sub_categories sc ON i.sub_category_id = sc.id
            JOIN 
                categories c ON sc.category_id = c.id
            JOIN 
                orders o ON oi.order_id = o.id
            JOIN 
                invoices inv ON o.invoice_id = inv.id
            WHERE 
                inv.restaurant_id = ?
            AND 
                DATE(inv.created_at) BETWEEN ? AND ?
            GROUP BY 
                i.id, i.name, c.name, sc.name
            ORDER BY 
                quantity_sold DESC
            LIMIT ?
        `;
        
        return await executeQuery(sql, [restaurant_id, actualStartDate, actualEndDate, parseInt(actualLimit)], "getTopSellingItems");
    } catch (error) {
        throw new CustomError(error.message, error.statusCode || 500);
    }
};

/**
 * Get hourly sales distribution
 * @param {Object} data - Query parameters
 * @returns {Promise<Array>} - Array of hourly sales data
 */
const getHourlySalesModel = async (data) => {
    try {
        const { restaurant_id, start_date, end_date } = data;
        
        if (!restaurant_id) {
            throw new CustomError("Restaurant ID is required", 400);
        }
        
        // Default to last 30 days if no date range provided
        const actualEndDate = end_date || new Date().toISOString().split('T')[0];
        
        const defaultStartDate = new Date();
        defaultStartDate.setDate(defaultStartDate.getDate() - 30);
        const actualStartDate = start_date || defaultStartDate.toISOString().split('T')[0];
        
        const sql = `
            SELECT 
                HOUR(i.created_at) as hour,
                COUNT(i.id) as invoice_count,
                SUM(i.total_amount) as total_sales,
                AVG(i.total_amount) as average_sale
            FROM 
                invoices i
            WHERE 
                i.restaurant_id = ?
            AND 
                DATE(i.created_at) BETWEEN ? AND ?
            GROUP BY 
                HOUR(i.created_at)
            ORDER BY 
                hour ASC
        `;
        
        return await executeQuery(sql, [restaurant_id, actualStartDate, actualEndDate], "getHourlySales");
    } catch (error) {
        throw new CustomError(error.message, error.statusCode || 500);
    }
};

/**
 * Get inventory usage report
 * @param {Object} data - Query parameters
 * @returns {Promise<Array>} - Array of inventory usage data
 */
const getInventoryUsageModel = async (data) => {
    try {
        const { restaurant_id, start_date, end_date } = data;
        
        if (!restaurant_id) {
            throw new CustomError("Restaurant ID is required", 400);
        }
        
        // Default to last 30 days if no date range provided
        const actualEndDate = end_date || new Date().toISOString().split('T')[0];
        
        const defaultStartDate = new Date();
        defaultStartDate.setDate(defaultStartDate.getDate() - 30);
        const actualStartDate = start_date || defaultStartDate.toISOString().split('T')[0];
        
        const sql = `
            SELECT 
                inv.id as inventory_id,
                inv.name as inventory_name,
                u.name as unit_name,
                SUM(sm.quantity) as usage_quantity,
                AVG(inv.price) as average_cost,
                SUM(sm.quantity * inv.price) as total_cost
            FROM 
                stock_movements sm
            JOIN 
                inventory inv ON sm.item_id = inv.id
            JOIN 
                units u ON inv.unit_id = u.id
            WHERE 
                inv.restaurant_id = ?
            AND 
                sm.movement_type_id = 2  -- Usage
            AND 
                DATE(sm.created_at) BETWEEN ? AND ?
            GROUP BY 
                inv.id, inv.name, u.name
            ORDER BY 
                usage_quantity DESC
        `;
        
        return await executeQuery(sql, [restaurant_id, actualStartDate, actualEndDate], "getInventoryUsage");
    } catch (error) {
        throw new CustomError(error.message, error.statusCode || 500);
    }
};

/**
 * Get dashboard summary
 * @param {Object} data - Query parameters
 * @returns {Promise<Object>} - Dashboard summary data
 */
const getDashboardSummaryModel = async (data) => {
    try {
        const { restaurant_id } = data;
        
        if (!restaurant_id) {
            throw new CustomError("Restaurant ID is required", 400);
        }
        
        // Get today's date
        const today = new Date().toISOString().split('T')[0];
        
        // Get yesterday's date
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        
        // Get last 7 days start date
        const last7DaysStart = new Date();
        last7DaysStart.setDate(last7DaysStart.getDate() - 7);
        const last7DaysStartStr = last7DaysStart.toISOString().split('T')[0];
        
        // Get last 30 days start date
        const last30DaysStart = new Date();
        last30DaysStart.setDate(last30DaysStart.getDate() - 30);
        const last30DaysStartStr = last30DaysStart.toISOString().split('T')[0];
        
        // Get current month start date
        const currentMonthStart = new Date();
        currentMonthStart.setDate(1);
        const currentMonthStartStr = currentMonthStart.toISOString().split('T')[0];
        
        // Get today's sales
        const todaySalesQuery = `
            SELECT 
                COUNT(i.id) as order_count,
                SUM(i.total_amount) as sales_amount
            FROM 
                invoices i
            WHERE 
                i.restaurant_id = ?
            AND 
                DATE(i.created_at) = ?
        `;
        
        const todaySales = await executeQuery(todaySalesQuery, [restaurant_id, today], "getTodaySales");
        
        // Get yesterday's sales
        const yesterdaySalesQuery = `
            SELECT 
                COUNT(i.id) as order_count,
                SUM(i.total_amount) as sales_amount
            FROM 
                invoices i
            WHERE 
                i.restaurant_id = ?
            AND 
                DATE(i.created_at) = ?
        `;
        
        const yesterdaySales = await executeQuery(yesterdaySalesQuery, [restaurant_id, yesterdayStr], "getYesterdaySales");
        
        // Get last 7 days sales
        const last7DaysSalesQuery = `
            SELECT 
                COUNT(i.id) as order_count,
                SUM(i.total_amount) as sales_amount
            FROM 
                invoices i
            WHERE 
                i.restaurant_id = ?
            AND 
                DATE(i.created_at) BETWEEN ? AND ?
        `;
        
        const last7DaysSales = await executeQuery(last7DaysSalesQuery, [restaurant_id, last7DaysStartStr, today], "getLast7DaysSales");
        
        // Get current month sales
        const currentMonthSalesQuery = `
            SELECT 
                COUNT(i.id) as order_count,
                SUM(i.total_amount) as sales_amount
            FROM 
                invoices i
            WHERE 
                i.restaurant_id = ?
            AND 
                DATE(i.created_at) BETWEEN ? AND ?
        `;
        
        const currentMonthSales = await executeQuery(currentMonthSalesQuery, [restaurant_id, currentMonthStartStr, today], "getCurrentMonthSales");
        
        // Get inventory alerts
        const inventoryAlertsQuery = `
            SELECT 
                COUNT(*) as alert_count
            FROM 
                inventory i
            WHERE 
                i.restaurant_id = ?
            AND 
                i.quantity <= i.threshold
            AND 
                i.deleted_at IS NULL
        `;
        
        const inventoryAlerts = await executeQuery(inventoryAlertsQuery, [restaurant_id], "getInventoryAlerts");
        
        // Get top 5 selling items today
        const topItemsTodayQuery = `
            SELECT 
                i.id as item_id,
                i.name as item_name,
                SUM(oi.quantity) as quantity_sold
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
            LIMIT 5
        `;
        
        const topItemsToday = await executeQuery(topItemsTodayQuery, [restaurant_id, today], "getTopItemsToday");
        
        // Get active tables count
        const activeTablesQuery = `
            SELECT 
                COUNT(DISTINCT t.id) as active_tables_count
            FROM 
                tables t
            JOIN 
                orders o ON t.id = o.table_id
            WHERE 
                t.restaurant_id = ?
            AND 
                o.status_id IN (1, 2, 3, 4) -- Active orders
            AND 
                o.deleted_at IS NULL
        `;
        
        const activeTables = await executeQuery(activeTablesQuery, [restaurant_id], "getActiveTables");
        
        // Get pending orders count
        const pendingOrdersQuery = `
            SELECT 
                COUNT(*) as pending_orders_count
            FROM 
                orders o
            WHERE 
                o.restaurant_id = ?
            AND 
                o.status_id = 1 -- Pending
            AND 
                o.deleted_at IS NULL
        `;
        
        const pendingOrders = await executeQuery(pendingOrdersQuery, [restaurant_id], "getPendingOrders");
        
        // Get orders in progress count
        const inProgressOrdersQuery = `
            SELECT 
                COUNT(*) as in_progress_orders_count
            FROM 
                orders o
            WHERE 
                o.restaurant_id = ?
            AND 
                o.status_id IN (2, 3) -- Captain approved, In kitchen
            AND 
                o.deleted_at IS NULL
        `;
        
        const inProgressOrders = await executeQuery(inProgressOrdersQuery, [restaurant_id], "getInProgressOrders");
        
        // Combine all data into a dashboard summary
        return {
            today_sales: todaySales[0] || { order_count: 0, sales_amount: 0 },
            yesterday_sales: yesterdaySales[0] || { order_count: 0, sales_amount: 0 },
            last_7_days_sales: last7DaysSales[0] || { order_count: 0, sales_amount: 0 },
            current_month_sales: currentMonthSales[0] || { order_count: 0, sales_amount: 0 },
            inventory_alerts: inventoryAlerts[0]?.alert_count || 0,
            top_items_today: topItemsToday || [],
            active_tables: activeTables[0]?.active_tables_count || 0,
            pending_orders: pendingOrders[0]?.pending_orders_count || 0,
            in_progress_orders: inProgressOrders[0]?.in_progress_orders_count || 0
        };
    } catch (error) {
        throw new CustomError(error.message, error.statusCode || 500);
    }
};

/**
 * Get revenue comparison (current vs previous period)
 * @param {Object} data - Query parameters
 * @returns {Promise<Object>} - Revenue comparison data
 */
const getRevenueComparisonModel = async (data) => {
    try {
        const { restaurant_id, period, start_date, end_date } = data;
        
        if (!restaurant_id) {
            throw new CustomError("Restaurant ID is required", 400);
        }
        
        // Default to 'month' if no period specified
        const actualPeriod = period || 'month';
        
        let currentPeriodStart, currentPeriodEnd, previousPeriodStart, previousPeriodEnd;
        
        // Calculate date ranges based on period
        if (start_date && end_date) {
            // Use custom date range if provided
            currentPeriodStart = start_date;
            currentPeriodEnd = end_date;
            
            // Calculate previous period with same duration
            const startDate = new Date(start_date);
            const endDate = new Date(end_date);
            const duration = (endDate - startDate) / (24 * 60 * 60 * 1000); // Duration in days
            
            const prevEndDate = new Date(startDate);
            prevEndDate.setDate(prevEndDate.getDate() - 1);
            
            const prevStartDate = new Date(prevEndDate);
            prevStartDate.setDate(prevStartDate.getDate() - duration);
            
            previousPeriodStart = prevStartDate.toISOString().split('T')[0];
            previousPeriodEnd = prevEndDate.toISOString().split('T')[0];
        } else {
            // Use predefined periods
            const today = new Date();
            
            switch (actualPeriod) {
                case 'day':
                    // Current day vs previous day
                    currentPeriodStart = currentPeriodEnd = today.toISOString().split('T')[0];
                    
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    previousPeriodStart = previousPeriodEnd = yesterday.toISOString().split('T')[0];
                    break;
                    
                case 'week':
                    // Current week vs previous week
                    const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday
                    const daysFromWeekStart = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Adjust to make Monday the first day
                    
                    const weekStart = new Date(today);
                    weekStart.setDate(today.getDate() - daysFromWeekStart);
                    weekStart.setHours(0, 0, 0, 0);
                    
                    currentPeriodStart = weekStart.toISOString().split('T')[0];
                    currentPeriodEnd = today.toISOString().split('T')[0];
                    
                    const prevWeekEnd = new Date(weekStart);
                    prevWeekEnd.setDate(prevWeekEnd.getDate() - 1);
                    
                    const prevWeekStart = new Date(prevWeekEnd);
                    prevWeekStart.setDate(prevWeekStart.getDate() - 6);
                    
                    previousPeriodStart = prevWeekStart.toISOString().split('T')[0];
                    previousPeriodEnd = prevWeekEnd.toISOString().split('T')[0];
                    break;
                    
                case 'month':
                default:
                    // Current month vs previous month
                    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
                    
                    currentPeriodStart = monthStart.toISOString().split('T')[0];
                    currentPeriodEnd = today.toISOString().split('T')[0];
                    
                    const prevMonthEnd = new Date(monthStart);
                    prevMonthEnd.setDate(prevMonthEnd.getDate() - 1);
                    
                    const prevMonthStart = new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), 1);
                    
                    previousPeriodStart = prevMonthStart.toISOString().split('T')[0];
                    previousPeriodEnd = prevMonthEnd.toISOString().split('T')[0];
                    break;
            }
        }
        
        // Get current period revenue
        const currentPeriodQuery = `
            SELECT 
                SUM(i.total_amount) as revenue,
                COUNT(i.id) as order_count,
                SUM(i.discount) as discount_amount,
                AVG(i.total_amount) as average_order_value
            FROM 
                invoices i
            WHERE 
                i.restaurant_id = ?
            AND 
                DATE(i.created_at) BETWEEN ? AND ?
        `;
        
        const currentPeriodData = await executeQuery(
            currentPeriodQuery, 
            [restaurant_id, currentPeriodStart, currentPeriodEnd], 
            "getCurrentPeriodRevenue"
        );
        
        // Get previous period revenue
        const previousPeriodQuery = `
            SELECT 
                SUM(i.total_amount) as revenue,
                COUNT(i.id) as order_count,
                SUM(i.discount) as discount_amount,
                AVG(i.total_amount) as average_order_value
            FROM 
                invoices i
            WHERE 
                i.restaurant_id = ?
            AND 
                DATE(i.created_at) BETWEEN ? AND ?
        `;
        
        const previousPeriodData = await executeQuery(
            previousPeriodQuery, 
            [restaurant_id, previousPeriodStart, previousPeriodEnd], 
            "getPreviousPeriodRevenue"
        );
        
        // Calculate growth/change percentages
        const currentRevenue = parseFloat(currentPeriodData[0]?.revenue || 0);
        const previousRevenue = parseFloat(previousPeriodData[0]?.revenue || 0);
        
        const currentOrderCount = parseInt(currentPeriodData[0]?.order_count || 0);
        const previousOrderCount = parseInt(previousPeriodData[0]?.order_count || 0);
        
        const currentAOV = parseFloat(currentPeriodData[0]?.average_order_value || 0);
        const previousAOV = parseFloat(previousPeriodData[0]?.average_order_value || 0);
        
        // Calculate percentage changes
        const revenueGrowth = previousRevenue === 0 
            ? (currentRevenue > 0 ? 100 : 0)
            : ((currentRevenue - previousRevenue) / previousRevenue) * 100;
            
        const orderCountGrowth = previousOrderCount === 0
            ? (currentOrderCount > 0 ? 100 : 0)
            : ((currentOrderCount - previousOrderCount) / previousOrderCount) * 100;
            
        const aovGrowth = previousAOV === 0
            ? (currentAOV > 0 ? 100 : 0)
            : ((currentAOV - previousAOV) / previousAOV) * 100;
        
        return {
            period_type: actualPeriod,
            current_period: {
                start_date: currentPeriodStart,
                end_date: currentPeriodEnd,
                revenue: currentRevenue,
                order_count: currentOrderCount,
                average_order_value: currentAOV,
                discount_amount: parseFloat(currentPeriodData[0]?.discount_amount || 0)
            },
            previous_period: {
                start_date: previousPeriodStart,
                end_date: previousPeriodEnd,
                revenue: previousRevenue,
                order_count: previousOrderCount,
                average_order_value: previousAOV,
                discount_amount: parseFloat(previousPeriodData[0]?.discount_amount || 0)
            },
            growth: {
                revenue_growth: parseFloat(revenueGrowth.toFixed(2)),
                order_count_growth: parseFloat(orderCountGrowth.toFixed(2)),
                aov_growth: parseFloat(aovGrowth.toFixed(2))
            }
        };
    } catch (error) {
        throw new CustomError(error.message, error.statusCode || 500);
    }
};

module.exports = {
    getDailySalesModel,
    getSalesByCategoryModel,
    getTopSellingItemsModel,
    getHourlySalesModel,
    getInventoryUsageModel,
    getDashboardSummaryModel,
    getRevenueComparisonModel
};