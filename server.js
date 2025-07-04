// server.js - UPDATED with conservative approach

require("dotenv").config();
require("./src/config/db");
const { IP, PORT } = process.env;

const http = require("http");
const app = require("./app");

// ✅ Import conservative safety cleanup
const { safetyCleanupAbandonedSessions } = require("./src/helpers/safetyCleanup");

const ip = IP || "localhost";
const port = PORT || "8000";

const server = http.createServer(app);

// ✅ Conservative safety cleanup job (runs every 6 hours, cleans 24+ hour old sessions)
const SAFETY_CLEANUP_INTERVAL = 6 * 60 * 60 * 1000; // 6 hours

function startSafetyCleanupJob() {
    console.log("🛡️  Starting conservative safety cleanup job (runs every 6 hours, cleans 24+ hour sessions)");

    // Run safety cleanup every 6 hours
    setInterval(async () => {
        try {
            const result = await safetyCleanupAbandonedSessions();
            if (result.cleaned > 0) {
                console.log(`🛡️  Safety cleanup: ${result.cleaned} abandoned sessions cleaned (24+ hours old)`);
            }
        } catch (error) {
            console.error("❌ Safety cleanup failed:", error);
        }
    }, SAFETY_CLEANUP_INTERVAL);
}

server.listen(port).on("error", (e) => {
    console.log(e);
});

console.log("**********" + ip + ":" + port + "**********");

// ✅ Start the conservative safety cleanup job
startSafetyCleanupJob();

// Graceful shutdown
process.on("SIGTERM", () => {
    console.log("🛑 SIGTERM received, shutting down gracefully");
    process.exit(0);
});

process.on("SIGINT", () => {
    console.log("🛑 SIGINT received, shutting down gracefully");
    process.exit(0);
});
