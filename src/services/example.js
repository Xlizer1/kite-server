// ===== USAGE EXAMPLES FOR UNIVERSAL NOTIFICATION SERVICE =====

const notificationService = require('../services/universalNotificationService');

// =================== 1. CAPTAIN CALL NOTIFICATION ===================
// Replace the old captain-specific code
async function sendCaptainCallNotification(restaurantId, tableData) {
    await notificationService.sendNotification({
        restaurantId,
        departments: [5], // CAPTAIN department
        
        type: 'CAPTAIN_CALL',
        title: 'Customer Needs Assistance',
        message: `Table ${tableData.table_number} is requesting help`,
        
        data: {
            tableId: tableData.table_id,
            tableNumber: tableData.table_number,
            callId: tableData.call_id
        },
        
        priority: 'high',
        actionRequired: true,
        sound: 'urgent',
        
        actions: [
            { action: 'respond', title: 'I\'ll Handle It' },
            { action: 'dismiss', title: 'Ignore' }
        ]
    });
}

// =================== 2. ORDER NOTIFICATIONS ===================
// New order to kitchen
async function notifyKitchenNewOrder(restaurantId, orderData) {
    await notificationService.sendNotification({
        restaurantId,
        departments: [6], // KITCHEN department
        
        type: 'NEW_ORDER',
        title: 'New Order Received',
        message: `Table ${orderData.table_number} - ${orderData.items_count} items`,
        
        data: {
            orderId: orderData.order_id,
            tableNumber: orderData.table_number,
            itemsCount: orderData.items_count
        },
        
        priority: 'normal',
        actionRequired: true
    });
}

// Order ready notification to captain
async function notifyOrderReady(restaurantId, orderData) {
    await notificationService.sendNotification({
        restaurantId,
        departments: [5], // CAPTAIN department
        
        type: 'ORDER_READY',
        title: 'Order Ready for Pickup',
        message: `Table ${orderData.table_number} order is ready`,
        
        data: {
            orderId: orderData.order_id,
            tableNumber: orderData.table_number
        },
        
        priority: 'high',
        actionRequired: true,
        sound: 'notification'
    });
}

// =================== 3. INVENTORY NOTIFICATIONS ===================
// Low stock alert to inventory admin and restaurant admin
async function sendLowStockAlert(restaurantId, inventoryItems) {
    await notificationService.sendNotification({
        restaurantId,
        departments: [2, 4], // RESTAURANT_ADMIN + INVENTORY_ADMIN
        
        type: 'LOW_STOCK_ALERT',
        title: 'Low Stock Alert',
        message: `${inventoryItems.length} items are running low`,
        
        data: {
            itemsCount: inventoryItems.length,
            items: inventoryItems.map(item => ({
                name: item.name,
                currentQuantity: item.quantity,
                threshold: item.threshold
            }))
        },
        
        priority: 'high',
        persistent: true, // Stays until acknowledged
        actionRequired: true
    });
}

// Critical inventory shortage to multiple departments
async function sendCriticalInventoryAlert(restaurantId, item) {
    await notificationService.sendNotification({
        restaurantId,
        departments: [1, 2, 4, 6], // ADMIN + RESTAURANT_ADMIN + INVENTORY_ADMIN + KITCHEN
        
        type: 'CRITICAL_INVENTORY',
        title: '🚨 Critical Stock Shortage',
        message: `${item.name} is completely out of stock!`,
        
        data: {
            itemId: item.id,
            itemName: item.name,
            currentQuantity: item.quantity
        },
        
        priority: 'urgent',
        persistent: true,
        actionRequired: true,
        sound: 'emergency'
    });
}

// =================== 4. FINANCIAL NOTIFICATIONS ===================
// Large payment notification to finance and admin
async function notifyLargePayment(restaurantId, paymentData) {
    await notificationService.sendNotification({
        restaurantId,
        departments: [1, 8], // ADMIN + FINANCE
        
        type: 'LARGE_PAYMENT',
        title: 'Large Payment Received',
        message: `Payment of $${paymentData.amount} received`,
        
        data: {
            amount: paymentData.amount,
            paymentMethod: paymentData.method,
            tableNumber: paymentData.table_number,
            invoiceId: paymentData.invoice_id
        },
        
        priority: 'normal'
    });
}

// =================== 5. SYSTEM NOTIFICATIONS ===================
// System maintenance alert to all admins
async function notifySystemMaintenance(restaurantId, maintenanceData) {
    await notificationService.sendNotification({
        restaurantId,
        departments: [1, 2, 3], // All admin levels
        
        type: 'SYSTEM_MAINTENANCE',
        title: 'Scheduled Maintenance',
        message: `System maintenance in ${maintenanceData.hours} hours`,
        
        data: {
            scheduledTime: maintenanceData.scheduled_time,
            duration: maintenanceData.duration,
            affectedSystems: maintenanceData.affected_systems
        },
        
        priority: 'high',
        persistent: true
    });
}

// =================== 6. STAFF NOTIFICATIONS ===================
// New staff member notification to restaurant admin
async function notifyNewStaffMember(restaurantId, staffData) {
    await notificationService.sendNotification({
        restaurantId,
        departments: [2], // RESTAURANT_ADMIN
        
        type: 'NEW_STAFF',
        title: 'New Staff Member Added',
        message: `${staffData.name} has been added to ${staffData.department_name}`,
        
        data: {
            staffId: staffData.id,
            staffName: staffData.name,
            department: staffData.department_name
        },
        
        priority: 'low'
    });
}

// =================== 7. SPECIFIC USER NOTIFICATIONS ===================
// Direct message to specific user(s)
async function sendDirectMessage(restaurantId, userIds, messageData) {
    await notificationService.sendNotification({
        restaurantId,
        userIds, // Send to specific users only
        
        type: 'DIRECT_MESSAGE',
        title: messageData.title,
        message: messageData.message,
        
        data: messageData.data || {},
        
        priority: messageData.priority || 'normal',
        actionRequired: messageData.actionRequired || false
    });
}

// =================== 8. EMERGENCY NOTIFICATIONS ===================
// Emergency alert to everyone in restaurant
async function sendEmergencyAlert(restaurantId, emergencyData) {
    await notificationService.sendNotification({
        restaurantId,
        departments: [1, 2, 3, 4, 5, 6, 7, 8], // ALL departments
        
        type: 'EMERGENCY',
        title: '🚨 EMERGENCY ALERT',
        message: emergencyData.message,
        
        data: {
            emergencyType: emergencyData.type,
            location: emergencyData.location,
            instructions: emergencyData.instructions
        },
        
        priority: 'urgent',
        persistent: true,
        actionRequired: true,
        sound: 'emergency'
    });
}

// =================== INTEGRATION EXAMPLES ===================

// In your existing controllers, replace old notification calls:

// OLD WAY (captain-specific):
// await firebaseRealtimeService.sendCaptainCallNotification(restaurantId, callData);

// NEW WAY (universal):
// await notificationService.sendNotification({
//     restaurantId,
//     departments: [5],
//     type: 'CAPTAIN_CALL',
//     title: 'Customer Needs Help',
//     message: `Table ${callData.table_number} needs assistance`,
//     priority: 'high'
// });

// =================== NOTIFICATION MANAGEMENT ===================

// Mark notification as read
async function markNotificationRead(notificationId, userId, restaurantId) {
    await notificationService.markAsRead(notificationId, userId, restaurantId);
}

// Handle notification action
async function handleNotificationAction(notificationId, userId, action, restaurantId) {
    await notificationService.markActionTaken(notificationId, userId, action, restaurantId);
    
    // Handle specific actions based on notification type
    switch (action) {
        case 'respond':
            // Handle response action
            break;
        case 'approve':
            // Handle approval action
            break;
        case 'dismiss':
            // Handle dismissal
            break;
    }
}

// Get notifications for a user
async function getUserNotifications(restaurantId, userId, filters = {}) {
    return await notificationService.getNotifications(restaurantId, userId, filters);
}

module.exports = {
    sendCaptainCallNotification,
    notifyKitchenNewOrder,
    notifyOrderReady,
    sendLowStockAlert,
    sendCriticalInventoryAlert,
    notifyLargePayment,
    notifySystemMaintenance,
    notifyNewStaffMember,
    sendDirectMessage,
    sendEmergencyAlert,
    markNotificationRead,
    handleNotificationAction,
    getUserNotifications
};