const firebaseRealtimeService = require("../../../services/firebaseRealtimeService");
const { resultObject, verifyUserToken, getToken } = require("../../../helpers/common");

/**
 * Register captain's FCM token for push notifications
 */
const registerFCMTokenController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(5)) {
            return callBack(resultObject(false, "Access denied"));
        }

        const { fcm_token, device_info } = request.body;

        if (!fcm_token) {
            return callBack(resultObject(false, "FCM token is required"));
        }

        await firebaseRealtimeService.registerCaptainToken(
            authorize.restaurant_id,
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
 * Mark notification as read
 */
const markNotificationReadController = async (request, callBack) => {
    try {
        const token = await getToken(request);
        const authorize = await verifyUserToken(token);

        if (!authorize?.roles?.includes(1) && !authorize?.roles?.includes(5)) {
            return callBack(resultObject(false, "Access denied"));
        }

        const { notification_type, notification_id } = request.params;

        await firebaseRealtimeService.markNotificationAsRead(
            authorize.restaurant_id,
            notification_type,
            notification_id
        );

        callBack(resultObject(true, "Notification marked as read"));
    } catch (error) {
        console.error("Error marking notification as read:", error);
        callBack(resultObject(false, "Failed to mark notification as read"));
    }
};

module.exports = {
    registerFCMTokenController,
    markNotificationReadController,
};
