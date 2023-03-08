const { createServer } = require("http");
const { Server } = require("socket.io");

require("dotenv").config(); // Loads .env file contents into process.env.

const app = require("./app");

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "localhost";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://127.0.0.1:5500/"],
    credentials: true,
  },
});

httpServer.listen(PORT, HOST, () => {
  console.log("Server running on port ->", PORT);
});
