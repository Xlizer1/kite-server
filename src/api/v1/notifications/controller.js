const notificationService = require('../../../services/universalNotificationService');
const { resultObject, verifyUserToken, getToken } = require('../../../helpers/common');
const { hasPermission } = require('../../../helpers/permissions');

/**
 * Register FCM token for user
 */
const registerFCMToken = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id) {
            return callBack(resultObject(false, "Authentication required"));
        }

        const { fcm_token, device_info } = request.body;

        if (!fcm_token) {
            return callBack(resultObject(false, "FCM token is required"));
        }

        await notificationService.registerUserToken(
            authorize.id,
            fcm_token,
            device_info
        );

        callBack(resultObject(true, "FCM token registered successfully"));
    } catch (error) {
        console.error("Error registering FCM token:", error);
        callBack(resultObject(false, "Failed to register FCM token"));
    }
};

/**
 * Get notifications for authenticated user
 */
const getNotifications = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.restaurant_id) {
            return callBack(resultObject(false, "Authentication required"));
        }

        const {
            limit = 50,
            type = null,
            unread_only = false,
            priority = null
        } = request.query;

        const filters = {
            limit: parseInt(limit),
            type,
            unreadOnly: unread_only === 'true',
            priority
        };

        const notifications = await notificationService.getNotifications(
            authorize.restaurant_id,
            authorize.id,
            filters
        );

        callBack(resultObject(true, "Notifications retrieved successfully", {
            notifications,
            total: notifications.length,
            unread_count: notifications.filter(n => !n.readBy || !n.readBy[authorize.id]).length
        }));
    } catch (error) {
        console.error("Error getting notifications:", error);
        callBack(resultObject(false, "Failed to retrieve notifications"));
    }
};

/**
 * Mark notification as read
 */
const markAsRead = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.restaurant_id) {
            return callBack(resultObject(false, "Authentication required"));
        }

        const { notification_id } = request.params;

        if (!notification_id) {
            return callBack(resultObject(false, "Notification ID is required"));
        }

        await notificationService.markAsRead(
            notification_id,
            authorize.id,
            authorize.restaurant_id
        );

        callBack(resultObject(true, "Notification marked as read"));
    } catch (error) {
        console.error("Error marking notification as read:", error);
        callBack(resultObject(false, "Failed to mark notification as read"));
    }
};

/**
 * Handle notification action
 */
const handleAction = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.restaurant_id) {
            return callBack(resultObject(false, "Authentication required"));
        }

        const { notification_id } = request.params;
        const { action } = request.body;

        if (!notification_id || !action) {
            return callBack(resultObject(false, "Notification ID and action are required"));
        }

        await notificationService.markActionTaken(
            notification_id,
            authorize.id,
            action,
            authorize.restaurant_id
        );

        callBack(resultObject(true, "Notification action recorded"));
    } catch (error) {
        console.error("Error handling notification action:", error);
        callBack(resultObject(false, "Failed to handle notification action"));
    }
};

/**
 * Send notification (admin/management only)
 */
const sendNotification = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.restaurant_id) {
            return callBack(resultObject(false, "Authentication required"));
        }

        // Check if user can send notifications
        if (!hasPermission(authorize.department_id, 'notifications', 'create')) {
            return callBack(resultObject(false, "Insufficient permissions to send notifications"));
        }

        const {
            departments = [],
            user_ids = [],
            type,
            title,
            message,
            data = {},
            priority = 'normal',
            action_required = false
        } = request.body;

        if (!type || !title || !message) {
            return callBack(resultObject(false, "Type, title, and message are required"));
        }

        const result = await notificationService.sendNotification({
            restaurantId: authorize.restaurant_id,
            departments,
            userIds: user_ids,
            type,
            title,
            message,
            data,
            priority,
            actionRequired: action_required
        });

        callBack(resultObject(true, "Notification sent successfully", {
            notification_id: result.notificationId,
            target_users_count: result.targetUsersCount
        }));
    } catch (error) {
        console.error("Error sending notification:", error);
        callBack(resultObject(false, "Failed to send notification"));
    }
};

/**
 * Get notification statistics (admin only)
 */
const getNotificationStats = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.id || !authorize?.restaurant_id) {
            return callBack(resultObject(false, "Authentication required"));
        }

        // Check if user can view notification stats
        if (!hasPermission(authorize.department_id, 'analytics', 'read')) {
            return callBack(resultObject(false, "Insufficient permissions to view notification statistics"));
        }

        // Get all notifications for the restaurant
        const allNotifications = await notificationService.getNotifications(
            authorize.restaurant_id,
            null,
            { limit: 1000 }
        );

        // Calculate statistics
        const stats = {
            total_notifications: allNotifications.length,
            by_type: {},
            by_priority: {},
            by_status: {},
            recent_activity: allNotifications.slice(0, 10)
        };

        // Group by type
        allNotifications.forEach(notification => {
            stats.by_type[notification.type] = (stats.by_type[notification.type] || 0) + 1;
            stats.by_priority[notification.priority] = (stats.by_priority[notification.priority] || 0) + 1;
            stats.by_status[notification.status] = (stats.by_status[notification.status] || 0) + 1;
        });

        callBack(resultObject(true, "Notification statistics retrieved successfully", stats));
    } catch (error) {
        console.error("Error getting notification statistics:", error);
        callBack(resultObject(false, "Failed to retrieve notification statistics"));
    }
};

module.exports = {
    registerFCMToken,
    getNotifications,
    markAsRead,
    handleAction,
    sendNotification,
    getNotificationStats
};