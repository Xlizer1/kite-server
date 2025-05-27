// 2. FIREBASE SERVICE
// src/services/firebaseRealtimeService.js
const { db, messaging } = require("../config/firebase-config");

class FirebaseRealtimeService {
    constructor() {
        this.notificationsRef = db.ref("notifications");
        this.tablesRef = db.ref("tables");
        this.ordersRef = db.ref("orders");
        this.captainCallsRef = db.ref("captain_calls");
    }

    // Send captain call notification
    async sendCaptainCallNotification(restaurantId, callData) {
        // restaurantId = 2 (from customer's restaurant)

        // ✅ STEP 1: Store notification ONLY in Restaurant 2's path
        await this.notificationsRef
            .child(`restaurants/${restaurantId}/captain_calls`) // restaurants/2/captain_calls
            .push(notification);

        // ✅ STEP 2: Get FCM tokens ONLY for Restaurant 2 captains
        const captainTokensSnapshot = await db.ref(`captain_tokens/${restaurantId}`).once("value");
        //                                                         ↑ restaurants/2 captains only

        // ✅ STEP 3: Send push notifications ONLY to Restaurant 2 captains
        const tokens = Object.values(captainTokens).map((captain) => captain.fcm_token);
        // tokens = ['fcm_token_captain_15', 'fcm_token_captain_23'] (only Restaurant 2)

        await messaging.sendMulticast({
            notification: { title: "Customer Assistance Required", body: "Table 5 needs help" },
            tokens: tokens, // 👈 Only Restaurant 2 captain tokens
        });
    }

    // Send order approval notification
    async sendOrderApprovalNotification(restaurantId, orderData) {
        try {
            const notification = {
                id: orderData.order_id,
                type: "ORDER_APPROVAL",
                restaurant_id: restaurantId,
                table_id: orderData.table_id,
                table_number: orderData.table_number,
                order_id: orderData.order_id,
                items_count: orderData.items_count,
                total_amount: orderData.total_amount,
                message: `New order from Table ${orderData.table_number}`,
                timestamp: admin.database.ServerValue.TIMESTAMP,
                status: "pending",
                priority: "medium",
            };

            // Add to Firebase Realtime Database
            await this.notificationsRef.child(`restaurants/${restaurantId}/order_approvals`).push(notification);

            // Update orders real-time data
            await this.ordersRef.child(`restaurants/${restaurantId}/${orderData.order_id}`).set({
                ...orderData,
                status: "pending_approval",
                created_at: admin.database.ServerValue.TIMESTAMP,
            });

            // Send push notifications
            await this.sendPushNotificationToCaptains(restaurantId, {
                title: "Order Approval Required",
                body: `Table ${orderData.table_number} - ${orderData.items_count} items`,
                data: {
                    type: "ORDER_APPROVAL",
                    order_id: orderData.order_id.toString(),
                    table_id: orderData.table_id.toString(),
                },
            });

            return true;
        } catch (error) {
            console.error("Error sending order approval notification:", error);
            throw error;
        }
    }

    // Update table status in real-time
    async updateTableStatus(restaurantId, tableData) {
        try {
            await this.tablesRef.child(`restaurants/${restaurantId}/${tableData.table_id}`).update({
                status: tableData.status,
                customer_count: tableData.customer_count,
                updated_at: admin.database.ServerValue.TIMESTAMP,
                updated_by: tableData.updated_by,
            });

            // Notify all connected captains about table status change
            await this.notificationsRef.child(`restaurants/${restaurantId}/table_updates`).push({
                type: "TABLE_STATUS_UPDATE",
                table_id: tableData.table_id,
                status: tableData.status,
                customer_count: tableData.customer_count,
                timestamp: admin.database.ServerValue.TIMESTAMP,
            });

            return true;
        } catch (error) {
            console.error("Error updating table status:", error);
            throw error;
        }
    }

    // Send push notification to all captains in restaurant
    async sendPushNotificationToCaptains(restaurantId, notification) {
        try {
            // Get all captain FCM tokens for this restaurant
            const captainTokensSnapshot = await db.ref(`captain_tokens/${restaurantId}`).once("value");
            const captainTokens = captainTokensSnapshot.val();

            if (!captainTokens) {
                console.log("No captain tokens found for restaurant", restaurantId);
                return;
            }

            const tokens = Object.values(captainTokens)
                .map((captain) => captain.fcm_token)
                .filter((token) => token);

            if (tokens.length === 0) {
                console.log("No valid FCM tokens found");
                return;
            }

            const message = {
                notification: {
                    title: notification.title,
                    body: notification.body,
                    icon: "/icon-192x192.png",
                    badge: "/badge-72x72.png",
                },
                data: notification.data,
                tokens: tokens,
                android: {
                    notification: {
                        sound: "notification_sound",
                        channelId: "captain_notifications",
                    },
                },
                apns: {
                    payload: {
                        aps: {
                            sound: "notification_sound.caf",
                        },
                    },
                },
                webpush: {
                    notification: {
                        icon: "/icon-192x192.png",
                        badge: "/badge-72x72.png",
                        requireInteraction: true,
                        actions: [
                            {
                                action: "respond",
                                title: "Respond",
                            },
                            {
                                action: "dismiss",
                                title: "Dismiss",
                            },
                        ],
                    },
                },
            };

            const response = await messaging.sendMulticast(message);
            console.log("Push notifications sent:", response.successCount, "/", tokens.length);

            // Clean up invalid tokens
            if (response.failureCount > 0) {
                await this.cleanupInvalidTokens(restaurantId, response.responses, tokens);
            }

            return response;
        } catch (error) {
            console.error("Error sending push notifications:", error);
            throw error;
        }
    }

    // Register captain's FCM token
    async registerCaptainToken(restaurantId, captainId, fcmToken, deviceInfo = {}) {
        try {
            await db.ref(`captain_tokens/${restaurantId}/${captainId}`).set({
                fcm_token: fcmToken,
                device_info: deviceInfo,
                registered_at: admin.database.ServerValue.TIMESTAMP,
                last_seen: admin.database.ServerValue.TIMESTAMP,
            });

            console.log("Captain FCM token registered successfully");
            return true;
        } catch (error) {
            console.error("Error registering captain token:", error);
            throw error;
        }
    }

    // Clean up invalid FCM tokens
    async cleanupInvalidTokens(restaurantId, responses, tokens) {
        const invalidTokens = [];
        responses.forEach((response, index) => {
            if (!response.success) {
                invalidTokens.push(tokens[index]);
            }
        });

        if (invalidTokens.length > 0) {
            console.log("Cleaning up invalid tokens:", invalidTokens.length);
            // Remove invalid tokens from database
            const captainTokensRef = db.ref(`captain_tokens/${restaurantId}`);
            const snapshot = await captainTokensRef.once("value");
            const captainTokens = snapshot.val();

            if (captainTokens) {
                for (const [captainId, data] of Object.entries(captainTokens)) {
                    if (invalidTokens.includes(data.fcm_token)) {
                        await captainTokensRef.child(captainId).remove();
                    }
                }
            }
        }
    }

    // Get real-time notifications for restaurant
    getRestaurantNotificationsRef(restaurantId) {
        return this.notificationsRef.child(`restaurants/${restaurantId}`);
    }

    // Get real-time tables data for restaurant
    getRestaurantTablesRef(restaurantId) {
        return this.tablesRef.child(`restaurants/${restaurantId}`);
    }

    // Mark notification as read
    async markNotificationAsRead(restaurantId, notificationType, notificationId) {
        try {
            await this.notificationsRef
                .child(`restaurants/${restaurantId}/${notificationType}/${notificationId}`)
                .update({
                    status: "read",
                    read_at: admin.database.ServerValue.TIMESTAMP,
                });
            return true;
        } catch (error) {
            console.error("Error marking notification as read:", error);
            throw error;
        }
    }
}

const firebaseRealtimeService = new FirebaseRealtimeService();
module.exports = firebaseRealtimeService;
