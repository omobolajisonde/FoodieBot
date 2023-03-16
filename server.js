const fs = require("fs");
const { join } = require("path");
const { createServer } = require("http");

const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config(); // Loads .env file contents into process.env.

const app = require("./app");
const connectToMongoDB = require("./db");
const sessionMiddleware = require("./middlewares/sessionMiddleware");
const wrap = require("./middlewares/socketMiddleware");
const Chat = require("./models/chatModel");
const User = require("./models/userModel");

const { handleChatSave, handleOptionSent } = require("./handlers");
const { saveToSession } = require("./helpers");

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "localhost";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [
      "https://foodiebotaltschool.azurewebsites.net",
      `http://localhost:${PORT}`,
    ],
    methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD"],
    credentials: true,
  },
});

io.use(wrap(sessionMiddleware));

connectToMongoDB()
  .then(() => {
    console.log("Connection to MongoDB is successful.");
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
io.on("connection", async (socket) => {
  const session = socket.request.session;
  session.menuDisplayed = undefined;
  saveToSession(session);
  let userId = session.userId;
  let user;
  if (!userId) {
    userId = uuidv4(); // creates a unique string as the userId
    session.userId = userId; // saves the userId in session
    saveToSession(session);
    user = await User.create({ userId }); // creates a new user in the DB with the userId
    console.log("New user onboarded! 🎉🎉🎉");
  } else {
    console.log("Welcome back! 🍿");
    user = await User.findOne({ userId }); // gets the user associated with the userId stored in the session
  }

  const options = JSON.parse(
    fs.readFileSync(join(__dirname, "data", "options.json"), "utf-8")
  );

  // On user join, send chat history and options
  const chats = await Chat.find({ userId: user._id });
  socket.emit("userJoin", { chats, opts: options });

  // Save chat to the DB
  socket.on("saveChat", handleChatSave(Chat, user));

  socket.on("sendOption", handleOptionSent(socket, session, user, User));
});
