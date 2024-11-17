require("dotenv").config();
const { IP, PORT } = process.env;

const http = require("http");
const app = require("./app");

try {
  const server = http.createServer(app);
  server.listen(PORT);
  console.log("**********" + IP + ":" + PORT + "**********");
} catch (error) {
  console.log("Error: ", error);
}
