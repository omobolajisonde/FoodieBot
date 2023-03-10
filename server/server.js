const { createServer } = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config(); // Loads .env file contents into process.env.

const app = require("./app");
const connectToMongoDB = require("./db");
const sessionMiddleware = require("./middlewares/sessionMiddleware");

const Resource = require("./models/resourceModel");
const Chat = require("./models/chatModel");

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || "localhost";

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

// convert a connect middleware to a Socket.IO middleware
const wrap = (middleware) => (socket, next) =>
  middleware(socket.request, {}, next);

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
  console.log(session.userId, "🎯");
  let userId = session.userId;
  if (!userId) {
    userId = uuidv4();
    session.userId = userId;
  }
  session.save(function (err) {
    if (err) {
      console.log(err);
    }
  });
  console.log(session.userId, "🎯🎯");
  // console.log(socket.id);

  // GET resources
  const resource = await Resource.find({});
  const options = resource[0].options;
  const menu = resource[0].menu;

  // Send options
  socket.emit("sendOptions", options);

  // Load Chat history
  const chats = await Chat.find({ userId: "5c8a34ed14eb5c17645c9108" });
  socket.emit("loadChatHistory", chats);

  // Save chat to the DB
  socket.on("saveChat", async ({ message, isBotMsg }) => {
    await Chat.create({
      message,
      isBotMsg,
      userId: "5c8a34ed14eb5c17645c9108",
    });
  });

  socket.on("sendOption", (option) => {
    const pattern = /^([2-9]|1\d|2[0-5])(,([2-9]|1\d|2[0-5]))*$/; // regular expression to include the range of numbers from 2 to 25 (both inclusive)
    switch (true) {
      case option === "1":
        socket.emit("botResponse", { type: "menu", data: { menu } });
        break;

      case option === "99":
        socket.emit("botResponse", { type: "menu", data: { menu } });
        break;

      case pattern.test(option):
        const items = option.split(",");
        const order = menu.filter((item) => items.includes(item.id));
        const total = order.reduce(
          (prevValue, item) => prevValue + item.price,
          0
        );
        socket.emit("botResponse", {
          type: "orderSummary",
          data: { order, total },
        });

      default:
        break;
    }
  });
});
