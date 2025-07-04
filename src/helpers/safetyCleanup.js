const { executeQuery } = require("./db");

/**
 * Very conservative cleanup - only for sessions abandoned 24+ hours
 * This is a safety net for edge cases, not normal operation
 */
async function safetyCleanupAbandonedSessions() {
    try {
        console.log("🛡️  Running safety cleanup for abandoned sessions (24+ hours)...");

        // Find sessions abandoned for more than 24 hours
        const abandonedSessionsQuery = `
            SELECT 
                c.session_id,
                c.table_id, 
                c.restaurant_id,
                t.number as table_number,
                c.updated_at,
                TIMESTAMPDIFF(HOUR, c.updated_at, NOW()) as hours_abandoned
            FROM carts c
            JOIN tables t ON c.table_id = t.id
            WHERE c.updated_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
        `;

        const abandonedSessions = await executeQuery(abandonedSessionsQuery, [], "getAbandonedSessions");

        if (abandonedSessions.length === 0) {
            console.log("✅ No abandoned sessions found (24+ hours)");
            return { cleaned: 0 };
        }

        console.log(`⚠️  Found ${abandonedSessions.length} sessions abandoned for 24+ hours`);

        for (const session of abandonedSessions) {
            try {
                // Clear cart items
                await executeQuery(
                    `
                    DELETE FROM cart_items 
                    WHERE cart_id = (SELECT id FROM carts WHERE session_id = ?)
                `,
                    [session.session_id],
                    "cleanupAbandonedCartItems"
                );

                // Clear cart
                await executeQuery(
                    `
                    DELETE FROM carts WHERE session_id = ?
                `,
                    [session.session_id],
                    "cleanupAbandonedCart"
                );

                // Reset table status
                await executeQuery(
                    `
                    UPDATE tables 
                    SET status = 'available', customer_count = 0, updated_at = CURRENT_TIMESTAMP
                    WHERE id = ? AND restaurant_id = ?
                `,
                    [session.table_id, session.restaurant_id],
                    "resetAbandonedTable"
                );

                console.log(
                    `🧹 Cleaned abandoned session: Table ${session.table_number} (${session.hours_abandoned} hours old)`
                );
            } catch (error) {
                console.error(`❌ Error cleaning abandoned session ${session.session_id}:`, error);
            }
        }

        console.log(`✅ Safety cleanup completed: ${abandonedSessions.length} abandoned sessions cleaned`);
        return { cleaned: abandonedSessions.length };
    } catch (error) {
        console.error("💥 Error in safety cleanup:", error);
        throw error;
    }
}

module.exports = {
    safetyCleanupAbandonedSessions,
};
