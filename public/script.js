import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
import Chat from "./Chat.js";
import { WEB_SOCKET_URL } from "./config.js";

export const socket = io(WEB_SOCKET_URL);
let options;

socket.io.on("error", (error) => {
  console.log(error.message || error);
});

socket.on("connect", () => {
  console.log(socket.id);
});

// Load Chat history and options
socket.on("userJoin", ({ chats, opts }) => {
  options = opts;
  Chat.renderChatHistory(chats);
  Chat.renderOptions(opts);
});

socket.on("botResponse", ({ type, data }) => {
  switch (type) {
    case "menu":
      Chat.renderMenu(data.menu);
      Chat.renderMessage(
        'To order, simply enter the number(s) of the item(s) you\'d like to order using the menu\'s number system above 👆. Separate multiple items with commas (no spaces). For example, "2,4,17" would order "Jollof Rice", "Pepper Soup" and "Fried Plantain".',
        true
      );
      break;

    case "checkout":
      Chat.renderMessage(data.text, true);
      Chat.renderOptions(options);
      break;

    case "currentOrder":
      Chat.renderCurrentOrder(data);
      Chat.renderMessage("Select 99 to checkout your order.", true);
      break;

    case "orderHistory":
      Chat.renderOrderHistory(data.orders);
      break;

    case "unknownInput":
      Chat.renderMessage(data.text, true);
      Chat.renderOptions(options);
      break;

    default:
      Chat.renderMessage(data.text, true);
      break;
  }
});

Chat.chatInput.addEventListener("submit", Chat.handleChatInput.bind(Chat));
