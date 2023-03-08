const { createServer } = require("http");
const { Server } = require("socket.io");

require("dotenv").config(); // Loads .env file contents into process.env.

const app = require("./app");
const connectToMongoDB = require("./db");

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "localhost";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:8081"],
    credentials: true,
  },
});

connectToMongoDB()
  .then(() => {
    httpServer.listen(PORT, HOST, () => {
      console.log("Server running on port ->", PORT);
    });
  })
  .catch((error) => {
    console.log(
      error.message || error,
      "Connection to MongoDB was unsuccessful."
    );
  });

// SOCKET.io
io.on("connection", (socket) => {
  console.log(socket.id);
});
