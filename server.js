require("dotenv").config(); // Initializing the enviroment variables
require("./src/config/db"); // Initializing the DB connection
const { IP, PORT } = process.env;

const http = require("http");

const app = require("./app");

const ip = IP || "localhost";
const port = PORT || "8000";

try {
    const server = http.createServer(app);
    server.listen(port).on("error", (e) => {
        console.log(e);
    });
    console.log("**********" + ip + ":" + port + "**********");
} catch (error) {
    console.log("Error: ", error);
}
