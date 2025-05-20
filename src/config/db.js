const mysql = require("mysql2");
const { DB_NAME, DB_HOST, DB_USER, DB_PASSWORD } = process.env;

const host = DB_HOST || "localhost";
const user = DB_USER || "root";
const password = DB_PASSWORD || "";
const database = DB_NAME || "kitedb";

let con = null;
let connectionReady = false;
let pendingQueries = [];

/* db connection with retry */
function connectWithRetry() {
    console.log("Trying to connect to the DB");
    con = mysql.createConnection({
        host,
        user,
        password,
        database,
        multipleStatements: true,
        charset: "utf8",
    });

    con.connect((err) => {
        if (err) {
            console.error("Error in DB connection:", err);
            console.log("Retrying DB connection in 5 seconds...");
            connectionReady = false;
            setTimeout(connectWithRetry, 5000);
        } else {
            console.log("DB Connected to:", database);
            connectionReady = true;

            // Process any pending queries
            while (pendingQueries.length > 0) {
                const { sqlOrOptions, paramsOrCallback, callbackOrUndefined } = pendingQueries.shift();
                con.query(sqlOrOptions, paramsOrCallback, callbackOrUndefined);
            }
        }
    });

    con.on("error", (err) => {
        if (err.code === "PROTOCOL_CONNECTION_LOST") {
            console.error("Database connection lost");
            console.log("Retrying DB connection in 5 seconds...");
            connectionReady = false;
            setTimeout(connectWithRetry, 5000);
        } else {
            console.error("Fatal error encountered:", err);
            connectionReady = false;
            if (con) con.destroy(); // Destroy the existing connection
            setTimeout(connectWithRetry, 5000);
        }
    });
}

// Initialize connection
connectWithRetry();

// This function handles both object-style and simple-style query calls
module.exports.query = function (sqlOrOptions, paramsOrCallback, callbackOrUndefined) {
    // Determine which parameter is the callback
    const callback = typeof paramsOrCallback === "function" ? paramsOrCallback : callbackOrUndefined;

    if (!connectionReady) {
        console.log("Connection not ready, queueing query or executing immediately after connection");

        // If we have a callback, we can queue the query
        if (callback && typeof callback === "function") {
            pendingQueries.push({ sqlOrOptions, paramsOrCallback, callbackOrUndefined });
        } else {
            // If no callback, return an error immediately
            if (callback) callback(new Error("No database connection available"), null);
        }
        return;
    }

    // Connection is ready, execute the query
    con.query(sqlOrOptions, paramsOrCallback, callbackOrUndefined);
};

// For code that expects the connection directly
module.exports.mysqlConnection = {
    getConnection: function (callback) {
        if (!connectionReady) {
            console.error("Cannot get connection, connection not ready");
            callback(new Error("No database connection available"), null);
            return;
        }

        // Pass the existing connection in a way that mimics a pool
        callback(null, {
            query: con.query.bind(con),
            beginTransaction: con.beginTransaction.bind(con),
            commit: con.commit.bind(con),
            rollback: con.rollback.bind(con),
            release: function () {}, // No-op since we're not using a pool
        });
    },
};
