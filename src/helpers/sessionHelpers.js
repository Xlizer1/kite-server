// ===== NEW SESSION VALIDATION HELPERS =====
// Create this new file: src/helpers/sessionHelpers.js

const { executeQuery } = require("./db");

/**
 * Validate session and get associated table/restaurant info
 * @param {string} sessionId - Cart session ID
 * @returns {Object|null} - Session data or null if invalid
 */
const validateSession = async (sessionId) => {
    try {
        if (!sessionId) {
            return null;
        }

        const sessionQuery = `
            SELECT 
                c.id as cart_id,
                c.table_id,
                c.restaurant_id,
                c.session_id,
                c.created_at,
                c.updated_at,
                t.number as table_number,
                t.name as table_name,
                t.status as table_status,
                r.name as restaurant_name
            FROM carts c
            JOIN tables t ON c.table_id = t.id
            JOIN restaurants r ON c.restaurant_id = r.id
            WHERE c.session_id = ?
        `;

        const result = await executeQuery(sessionQuery, [sessionId], "validateSession");

        if (result && result.length > 0) {
            return result[0];
        }

        return null;
    } catch (error) {
        console.error("Error validating session:", error);
        return null;
    }
};

/**
 * Check if table has any active sessions
 * @param {number} tableId - Table ID
 * @param {number} restaurantId - Restaurant ID
 * @returns {Array} - Array of active sessions
 */
const getTableActiveSessions = async (tableId, restaurantId) => {
    try {
        const sessionsQuery = `
            SELECT 
                c.id,
                c.session_id,
                c.created_at,
                c.updated_at,
                COUNT(ci.id) as item_count
            FROM carts c
            LEFT JOIN cart_items ci ON c.id = ci.cart_id
            WHERE c.table_id = ? AND c.restaurant_id = ?
            GROUP BY c.id, c.session_id, c.created_at, c.updated_at
            ORDER BY c.updated_at DESC
        `;

        const result = await executeQuery(sessionsQuery, [tableId, restaurantId], "getTableActiveSessions");
        return result || [];
    } catch (error) {
        console.error("Error getting table active sessions:", error);
        return [];
    }
};

/**
 * Get or create session for a table (handles session sharing)
 * @param {number} tableId - Table ID
 * @param {number} restaurantId - Restaurant ID
 * @param {string|null} existingSessionId - Existing session ID if any
 * @returns {Object} - Session info
 */
const getOrCreateTableSession = async (tableId, restaurantId, existingSessionId = null) => {
    try {
        // First, check if table already has an active session
        const activeSessions = await getTableActiveSessions(tableId, restaurantId);

        if (activeSessions.length > 0) {
            // Use the most recent session
            const latestSession = activeSessions[0];

            // Update activity timestamp
            await executeQuery(
                "UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE session_id = ?",
                [latestSession.session_id],
                "updateSessionActivity"
            );

            return {
                sessionId: latestSession.session_id,
                cartId: latestSession.id,
                isNew: false,
                shared: activeSessions.length > 1,
            };
        }

        // If existing session provided, validate it belongs to this table
        if (existingSessionId) {
            const sessionValidation = await validateSession(existingSessionId);
            if (
                sessionValidation &&
                sessionValidation.table_id === tableId &&
                sessionValidation.restaurant_id === restaurantId
            ) {
                // Update activity timestamp
                await executeQuery(
                    "UPDATE carts SET updated_at = CURRENT_TIMESTAMP WHERE session_id = ?",
                    [existingSessionId],
                    "updateSessionActivity"
                );

                return {
                    sessionId: existingSessionId,
                    cartId: sessionValidation.cart_id,
                    isNew: false,
                    shared: false,
                };
            }
        }

        // Create new session
        const { v4: uuidv4 } = require("uuid");
        const newSessionId = uuidv4();

        const createCartQuery = `
            INSERT INTO carts (table_id, restaurant_id, session_id, created_at, updated_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;

        const result = await executeQuery(createCartQuery, [tableId, restaurantId, newSessionId], "createNewSession");

        if (result && result.insertId) {
            return {
                sessionId: newSessionId,
                cartId: result.insertId,
                isNew: true,
                shared: false,
            };
        }

        throw new Error("Failed to create new session");
    } catch (error) {
        console.error("Error in getOrCreateTableSession:", error);
        throw error;
    }
};

/**
 * Clear all sessions for a table
 * @param {number} tableId - Table ID
 * @param {number} restaurantId - Restaurant ID
 * @param {number} userId - User performing the action
 * @returns {Object} - Clear result
 */
const clearTableSessions = async (tableId, restaurantId, userId = null) => {
    try {
        // Get count of sessions being cleared
        const sessionCountQuery = `
            SELECT COUNT(*) as session_count
            FROM carts 
            WHERE table_id = ? AND restaurant_id = ?
        `;
        const sessionCount = await executeQuery(sessionCountQuery, [tableId, restaurantId], "getSessionCount");
        const sessionsCleared = sessionCount[0]?.session_count || 0;

        // Clear cart items
        await executeQuery(
            `DELETE FROM cart_items 
             WHERE cart_id IN (SELECT id FROM carts WHERE table_id = ? AND restaurant_id = ?)`,
            [tableId, restaurantId],
            "clearCartItems"
        );

        // Clear carts
        await executeQuery(
            `DELETE FROM carts WHERE table_id = ? AND restaurant_id = ?`,
            [tableId, restaurantId],
            "clearCarts"
        );

        // Reset table status
        const resetTableQuery = `
            UPDATE tables 
            SET status = 'available', 
                customer_count = 0, 
                updated_at = CURRENT_TIMESTAMP
                ${userId ? ", updated_by = ?" : ""}
            WHERE id = ? AND restaurant_id = ?
        `;

        const params = userId ? [userId, tableId, restaurantId] : [tableId, restaurantId];
        await executeQuery(resetTableQuery, params, "resetTable");

        return {
            success: true,
            sessionsCleared,
            message: `${sessionsCleared} sessions cleared for table`,
        };
    } catch (error) {
        console.error("Error clearing table sessions:", error);
        return {
            success: false,
            error: error.message,
        };
    }
};

module.exports = {
    validateSession,
    getTableActiveSessions,
    getOrCreateTableSession,
    clearTableSessions,
};
