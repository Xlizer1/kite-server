const mysql = require("mysql");

const { IP, PORT, DB_NAME, DB_HOST, DB_USER, DB_PASSWORD } = process.env;

const host = DB_HOST || "localhost";
const user = DB_USER || "root";
const password = DB_PASSWORD || "";
const database = DB_NAME || "restaurantdb";

let con;

/* db connection with retry */
function connectWithRetry() {
  console.log("Trying to connect to the DB");
  con = mysql.createConnection({
    host: host,
    user: user,
    password: password,
    database: database,
    multipleStatements: true,
    charset: "utf8",
    queryTimeout: 5000,
    timezone: "Asia/Baghdad",
  });

  con.connect((err) => {
    if (err) {
      console.error("Error in DB connection:", err);
      console.log("Retrying DB connection in 5 seconds...");

      // Retry the connection after a delay
      setTimeout(connectWithRetry, 5000);
    } else {
      console.log("DB Connected to:", database);
    }
  });

  con.on("error", (err) => {
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      console.error("Database connection lost");
      console.log("Retrying DB connection in 5 seconds...");

      // Retry the connection after a delay
      setTimeout(connectWithRetry, 5000);
    } else {
      console.error("Fatal error encountered, creating a new DB connection");
      con.destroy(); // Destroy the existing connection

      // Retry the connection immediately
      connectWithRetry();
    }
  });
}

connectWithRetry();

module.exports.mysqlConnection = con;

module.exports.query = function (...args) {
  if (con && con.state === "authenticated") {
    con.query(...args, (err, results) => {
      if (err) {
        console.error("Error executing query:", err);
      } else {
        console.log("Query executed successfully:", results);
      }
    });
  } else {
    console.error("Cannot execute query, no valid DB connection available");
    connectWithRetry();
  }
};
