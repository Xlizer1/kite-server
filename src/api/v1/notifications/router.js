const express = require("express");
const {
    registerFCMToken,
    getNotifications,
    markAsRead,
    handleAction,
    sendNotification,
    getNotificationStats
} = require("./controller");
const { checkUserAuthorized } = require("../../../helpers/common");
const { requireManagement } = require("../../../helpers/permissions");
const validateRequest = require("../../../middleware/validateRequest");
const { 
    registerFCMTokenSchema,
    sendNotificationSchema,
    handleActionSchema
} = require("../../../validators/notificationValidator");

const router = express.Router();

// All routes require authentication
router.use(checkUserAuthorized());

/**
 * @swagger
 * /api/v1/notifications/register-token:
 *   post:
 *     summary: Register FCM token
 *     description: Register user's FCM token for push notifications
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fcm_token
 *             properties:
 *               fcm_token:
 *                 type: string
 *                 description: Firebase Cloud Messaging token
 *               device_info:
 *                 type: object
 *                 properties:
 *                   platform:
 *                     type: string
 *                   version:
 *                     type: string
 *                   model:
 *                     type: string
 *     responses:
 *       200:
 *         description: Token registered successfully
 */
router.post("/register-token", validateRequest(registerFCMTokenSchema), (req, res) => {
    registerFCMToken(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/notifications:
 *   get:
 *     summary: Get user notifications
 *     description: Retrieve notifications for the authenticated user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of notifications to return
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by notification type
 *       - in: query
 *         name: unread_only
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Return only unread notifications
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, normal, high, urgent]
 *         description: Filter by priority level
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 */
router.get("/", (req, res) => {
    getNotifications(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/notifications/{notification_id}/read:
 *   post:
 *     summary: Mark notification as read
 *     description: Mark a specific notification as read by the user
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     responses:
 *       200:
 *         description: Notification marked as read
 */
router.post("/:notification_id/read", (req, res) => {
    markAsRead(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/notifications/{notification_id}/action:
 *   post:
 *     summary: Handle notification action
 *     description: Record an action taken on a notification
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notification_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Notification ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 description: Action taken (approve, dismiss, respond, etc.)
 *     responses:
 *       200:
 *         description: Action recorded successfully
 */
router.post("/:notification_id/action", validateRequest(handleActionSchema), (req, res) => {
    handleAction(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/notifications/send:
 *   post:
 *     summary: Send notification
 *     description: Send a notification to users (management only)
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - message
 *             properties:
 *               departments:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Target department IDs
 *               user_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Target user IDs
 *               type:
 *                 type: string
 *                 description: Notification type
 *               title:
 *                 type: string
 *                 description: Notification title
 *               message:
 *                 type: string
 *                 description: Notification message
 *               data:
 *                 type: object
 *                 description: Additional data payload
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high, urgent]
 *                 default: normal
 *               action_required:
 *                 type: boolean
 *                 default: false
 *     responses:
 *       200:
 *         description: Notification sent successfully
 */
router.post("/send", requireManagement, validateRequest(sendNotificationSchema), (req, res) => {
    sendNotification(req, (result) => {
        res.json(result);
    });
});

/**
 * @swagger
 * /api/v1/notifications/stats:
 *   get:
 *     summary: Get notification statistics
 *     description: Get notification statistics for the restaurant (management only)
 *     tags: [Notifications]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get("/stats", requireManagement, (req, res) => {
    getNotificationStats(req, (result) => {
        res.json(result);
    });
});

module.exports = router;