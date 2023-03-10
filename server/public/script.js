import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const socket = io("http://localhost:5000");

const chatSpace = document.getElementById("chat__space");
const chatInput = document.getElementById("chat__input");

socket.io.on("error", (error) => {
  console.log(error.message || error);
});

socket.on("connect", () => {
  console.log(socket.id);
});
// Load Chat history

socket.on("loadChatHistory", (chats) => {
  loadChatHistory(chats);
});

// Send options

socket.on("sendOptions", (options) => {
  displayOptions(options);
});

socket.on("botResponse", ({ type, data }) => {
  switch (type) {
    case "menu":
      displayMenu(data.menu);
      break;

    case "orderSummary":
      displayOrderSummary(data);
      break;

    default:
      break;
  }
});

chatInput.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(this);
  const msg = formData.get("chat").trim();
  socket.emit("sendOption", msg);
  displayMessage(msg, false);
});

function loadChatHistory(chats) {
  chats.forEach((chat) => {
    const chatCon = document.createElement("div");
    chatCon.className = `chat__con chat__con-${chat.isBotMsg ? "bot" : "user"}`;
    const chatInfo = document.createElement("div");
    chatInfo.className = chat.isBotMsg ? "chat__bot" : "chat__user";
    chatInfo.innerHTML = chat.isBotMsg
      ? '<img src="./bot.jpg" alt="Bot pic" /><span>FoodieBot</span><span>13:45</span>'
      : "<span>13:45</span>";
    const chatBubble = document.createElement("div");
    chatBubble.className = "chat__bubble";
    chatBubble.innerHTML = chat.message;
    chatCon.insertAdjacentElement("beforeend", chatInfo);
    chatCon.insertAdjacentElement("beforeend", chatBubble);
    chatSpace.insertAdjacentElement("beforeend", chatCon);
  });
}

function displayBotChat(botResponse) {
  const chatCon = document.createElement("div");
  chatCon.className = "chat__con chat__con-bot";
  const chatInfo = document.createElement("div");
  chatInfo.className = "chat__bot";
  chatInfo.innerHTML =
    '<img src="./bot.jpg" alt="Bot pic" /><span>FoodieBot</span><span>13:45</span>';
  const chatBubble = document.createElement("div");
  chatBubble.className = "chat__bubble";
  chatBubble.innerHTML = botResponse;
  chatCon.insertAdjacentElement("beforeend", chatInfo);
  chatCon.insertAdjacentElement("beforeend", chatBubble);
  chatSpace.insertAdjacentElement("beforeend", chatCon);
  //   Save to DB
  //   socket.emit("saveChat", { message: chatMsg, isBotMsg: true });
}

function displayOptions(options) {
  const chatMsg = `<ul>${options
    .map((opt) => `<li>${opt}</li>`)
    .join("")}</ul>`;
  displayBotChat(chatMsg);
}

function displayMenu(menu) {
  const chatMsg = `<ol class="food-list" start="2">${menu
    .map(
      (item) => `<li>
      <span>${item.name}</span> - ${item.price} NGN - <span>${item.course}</span> -
      ${item.cuisine}
    </li>`
    )
    .join("")}</ul>`;
  displayBotChat(chatMsg);
}

function displayOrderSummary(data) {
  const chatMsg = `<div class="order">
    <h3>Order Summary</h3>
    <ul>
    ${data.order.map(
      (item) => `<li>
    <span class="order__name">${item.name}</span>
    <span class="order__price">₦${item.price}</span>
  </li>`
    )}
    </ul>
    <div class="order__total">
      <span>Total:</span>
      <span>₦${data.total}</span>
    </div>`;
  displayBotChat(chatMsg);
}

function displayMessage(message, isBotMsg) {
  const chatCon = document.createElement("div");
  chatCon.className = `chat__con chat__con-${isBotMsg ? "bot" : "user"}`;
  const chatInfo = document.createElement("div");
  chatInfo.className = isBotMsg ? "chat__bot" : "chat__user";
  chatInfo.innerHTML = isBotMsg
    ? '<img src="./bot.jpg" alt="Bot pic" /><span>FoodieBot</span><span>13:45</span>'
    : "<span>13:45</span>";
  const chatBubble = document.createElement("div");
  chatBubble.className = "chat__bubble";
  chatBubble.innerHTML = message;
  chatCon.insertAdjacentElement("beforeend", chatInfo);
  chatCon.insertAdjacentElement("beforeend", chatBubble);
  chatSpace.insertAdjacentElement("beforeend", chatCon);
  //   Save to DB
  socket.emit("saveChat", { message, isBotMsg });
}
