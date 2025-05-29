const { db, messaging, admin } = require("../config/firebase-config");

class UniversalNotificationService {
    constructor() {
        this.notificationsRef = db.ref("notifications");
        this.userTokensRef = db.ref("user_tokens");
        this.notificationHistoryRef = db.ref("notification_history");
    }

    /**
     * @param {Object} notificationData - Notification configuration
     */
    async sendNotification(notificationData) {
        try {
            const {
                // Target Configuration
                restaurantId,
                departments = [], // [5, 6] for Captain + Kitchen
                userIds = [],     // Specific user IDs
                
                // Notification Content
                type,            // 'ORDER_UPDATE', 'INVENTORY_ALERT', etc.
                title,
                message,
                data = {},       // Additional data payload
                
                // Notification Settings
                priority = 'normal', // 'low', 'normal', 'high', 'urgent'
                persistent = false,  // Should stay until manually dismissed
                actionRequired = false, // Requires user action
                
                // Optional Features
                sound = 'default',
                icon = '/icon-192x192.png',
                actions = []     // [{action: 'approve', title: 'Approve'}]
            } = notificationData;

            // Generate unique notification ID
            const notificationId = this.generateNotificationId();
            
            // Build notification object
            const notification = {
                id: notificationId,
                type,
                title,
                message,
                data,
                priority,
                persistent,
                actionRequired,
                restaurantId,
                departments,
                userIds,
                status: 'sent',
                createdAt: admin.database.ServerValue.TIMESTAMP,
                readBy: {},
                actionTakenBy: null
            };

            // Store in Firebase Realtime Database
            await this.storeNotification(restaurantId, notification);
            
            // Get target users
            const targetUsers = await this.getTargetUsers(restaurantId, departments, userIds);
            
            // Send push notifications
            if (targetUsers.length > 0) {
                await this.sendPushNotifications(targetUsers, {
                    title,
                    body: message,
                    data: {
                        notificationId,
                        type,
                        ...data
                    },
                    priority,
                    sound,
                    icon,
                    actions
                });
            }

            return {
                success: true,
                notificationId,
                targetUsersCount: targetUsers.length
            };
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error;
        }
    }

    /**
     * 📱 Register FCM token for any user
     */
    async registerUserToken(userId, fcmToken, deviceInfo = {}) {
        try {
            await this.userTokensRef.child(userId).set({
                fcmToken,
                deviceInfo: {
                    platform: deviceInfo.platform || 'unknown',
                    version: deviceInfo.version || 'unknown',
                    ...deviceInfo
                },
                registeredAt: admin.database.ServerValue.TIMESTAMP,
                lastSeen: admin.database.ServerValue.TIMESTAMP
            });

            console.log(`FCM token registered for user ${userId}`);
            return true;
        } catch (error) {
            console.error('Error registering user token:', error);
            throw error;
        }
    }

    /**
     * 👀 Mark notification as read
     */
    async markAsRead(notificationId, userId, restaurantId) {
        try {
            await this.notificationsRef
                .child(`restaurants/${restaurantId}/${notificationId}/readBy/${userId}`)
                .set(admin.database.ServerValue.TIMESTAMP);
            
            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error);
            throw error;
        }
    }

    /**
     * ✅ Mark notification action as taken
     */
    async markActionTaken(notificationId, userId, action, restaurantId) {
        try {
            await this.notificationsRef
                .child(`restaurants/${restaurantId}/${notificationId}`)
                .update({
                    actionTakenBy: userId,
                    actionTaken: action,
                    actionTakenAt: admin.database.ServerValue.TIMESTAMP,
                    status: 'completed'
                });
            
            return true;
        } catch (error) {
            console.error('Error marking action taken:', error);
            throw error;
        }
    }

    /**
     * 📋 Get notifications for a user/restaurant
     */
    async getNotifications(restaurantId, userId = null, filters = {}) {
        try {
            const {
                limit = 50,
                type = null,
                unreadOnly = false,
                priority = null
            } = filters;

            let query = this.notificationsRef
                .child(`restaurants/${restaurantId}`)
                .orderByChild('createdAt')
                .limitToLast(limit);

            const snapshot = await query.once('value');
            let notifications = [];

            if (snapshot.exists()) {
                const data = snapshot.val();
                notifications = Object.entries(data).map(([id, notification]) => ({
                    id,
                    ...notification
                }));

                // Filter by type if specified
                if (type) {
                    notifications = notifications.filter(n => n.type === type);
                }

                // Filter unread only if specified
                if (unreadOnly && userId) {
                    notifications = notifications.filter(n => !n.readBy || !n.readBy[userId]);
                }

                // Filter by priority if specified
                if (priority) {
                    notifications = notifications.filter(n => n.priority === priority);
                }
            }

            return notifications.reverse(); // Most recent first
        } catch (error) {
            console.error('Error getting notifications:', error);
            throw error;
        }
    }

    // =================== PRIVATE METHODS ===================

    async storeNotification(restaurantId, notification) {
        await this.notificationsRef
            .child(`restaurants/${restaurantId}/${notification.id}`)
            .set(notification);
    }

    async getTargetUsers(restaurantId, departments, userIds) {
        try {
            const targetUsers = [];

            // Get users by departments
            if (departments.length > 0) {
                // This would need a database query to get users by department
                // For now, placeholder - you'd implement this based on your user system
                const departmentUsers = await this.getUsersByDepartments(restaurantId, departments);
                targetUsers.push(...departmentUsers);
            }

            // Get specific users
            if (userIds.length > 0) {
                const specificUsers = await this.getUsersByIds(userIds);
                targetUsers.push(...specificUsers);
            }

            // Remove duplicates and get FCM tokens
            const uniqueUsers = targetUsers.filter((user, index, self) => 
                index === self.findIndex(u => u.id === user.id)
            );

            // Get FCM tokens for each user
            const usersWithTokens = [];
            for (const user of uniqueUsers) {
                const tokenSnapshot = await this.userTokensRef.child(user.id).once('value');
                if (tokenSnapshot.exists()) {
                    const tokenData = tokenSnapshot.val();
                    usersWithTokens.push({
                        ...user,
                        fcmToken: tokenData.fcmToken
                    });
                }
            }

            return usersWithTokens.filter(user => user.fcmToken);
        } catch (error) {
            console.error('Error getting target users:', error);
            return [];
        }
    }

    async sendPushNotifications(users, notificationPayload) {
        try {
            const tokens = users.map(user => user.fcmToken).filter(token => token);
            
            if (tokens.length === 0) {
                console.log('No valid FCM tokens found');
                return;
            }

            const message = {
                notification: {
                    title: notificationPayload.title,
                    body: notificationPayload.body,
                    icon: notificationPayload.icon
                },
                data: Object.fromEntries(
                    Object.entries(notificationPayload.data).map(([key, value]) => 
                        [key, String(value)]
                    )
                ),
                tokens,
                android: {
                    notification: {
                        sound: notificationPayload.sound,
                        channelId: 'restaurant_notifications',
                        priority: this.mapPriorityToAndroid(notificationPayload.priority)
                    }
                },
                apns: {
                    payload: {
                        aps: {
                            sound: `${notificationPayload.sound}.caf`,
                            badge: 1
                        }
                    }
                },
                webpush: {
                    notification: {
                        icon: notificationPayload.icon,
                        requireInteraction: notificationPayload.priority === 'urgent',
                        actions: notificationPayload.actions
                    }
                }
            };

            const response = await messaging.sendMulticast(message);
            console.log(`Push notifications sent: ${response.successCount}/${tokens.length}`);

            // Clean up invalid tokens
            if (response.failureCount > 0) {
                await this.cleanupInvalidTokens(response.responses, tokens, users);
            }

            return response;
        } catch (error) {
            console.error('Error sending push notifications:', error);
            throw error;
        }
    }

    generateNotificationId() {
        return `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    }

    mapPriorityToAndroid(priority) {
        const priorityMap = {
            'low': 'min',
            'normal': 'default', 
            'high': 'high',
            'urgent': 'max'
        };
        return priorityMap[priority] || 'default';
    }

    async cleanupInvalidTokens(responses, tokens, users) {
        const invalidTokens = [];
        responses.forEach((response, index) => {
            if (!response.success) {
                invalidTokens.push({
                    token: tokens[index],
                    user: users[index]
                });
            }
        });

        // Remove invalid tokens from database
        for (const invalid of invalidTokens) {
            await this.userTokensRef.child(invalid.user.id).remove();
        }
    }

    // Placeholder methods - implement based on your user system
    async getUsersByDepartments(restaurantId, departments) {
        // TODO: Query your users table to get users by department_id and restaurant_id
        return [];
    }

    async getUsersByIds(userIds) {
        // TODO: Query your users table to get users by IDs
        return [];
    }
}

// Export singleton instance
const universalNotificationService = new UniversalNotificationService();
module.exports = universalNotificationService;