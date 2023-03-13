import { socket } from "./script.js";

class Chat {
  #chatSpace = document.getElementById("chat__space");
  #chatField = document.getElementById("chat__field");
  chatInput = document.getElementById("chat__input");
  constructor() {
    // socket = io("http://localhost:5000");
  }

  #scrollToBottom() {
    this.#chatSpace.scrollTo({
      top: this.#chatSpace.scrollHeight,
      behavior: "smooth",
    });
  }

  renderMessage(message, isBotMsg, saveToDB = true, msgTime = undefined) {
    const date = msgTime ? new Date(msgTime) : new Date();
    const options = {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: false,
    };
    const timeString = date.toLocaleString(undefined, options);
    const chatCon = document.createElement("div");
    chatCon.className = `chat__con chat__con-${isBotMsg ? "bot" : "user"}`;
    const chatInfo = document.createElement("div");
    chatInfo.className = isBotMsg ? "chat__bot" : "chat__user";
    chatInfo.innerHTML = isBotMsg
      ? `<img src="./bot.jpg" alt="Bot pic" /><span>FoodieBot</span><span>${timeString}</span>`
      : `<span>${timeString}</span>`;
    const chatBubble = document.createElement("div");
    chatBubble.className = "chat__bubble";
    chatBubble.innerHTML = message;
    chatCon.insertAdjacentElement("beforeend", chatInfo);
    chatCon.insertAdjacentElement("beforeend", chatBubble);
    this.#chatSpace.insertAdjacentElement("beforeend", chatCon);
    // Scrolls to the bottom of the chat container
    this.#scrollToBottom();
    //   Save to DB
    if (saveToDB) {
      socket.emit("saveChat", { message, isBotMsg });
    }
  }

  handleChatInput(e) {
    e.preventDefault();
    const formData = new FormData(this.chatInput);
    const msg = formData.get("chat").trim();
    this.#chatField.value = "";
    socket.emit("sendOption", msg);
    this.renderMessage(msg, false);
  }

  renderChatHistory(chats) {
    chats.forEach((chat) => {
      this.renderMessage(chat.message, chat.isBotMsg, false, chat.createdAt);
    });
  }

  renderOptions(options) {
    const chatMsg = `<ul>${options
      .map((option) => `<li>${option}</li>`)
      .join("")}</ul>`;
    this.renderMessage(chatMsg, true, false);
  }

  renderMenu(menu) {
    const chatMsg = `<ol class="food-list" start="2">${menu
      .map(
        (item) => `<li>
        <span>${item.name}</span> - ${item.price} NGN - <span>${item.course}</span> -
        ${item.cuisine}
      </li>`
      )
      .join("")}</ul>`;
    this.renderMessage(chatMsg, true);
  }

  renderCurrentOrder(data) {
    const chatMsg = `<div class="order">
      <h3>Current Order</h3>
      <ul>
      ${data.order
        .map(
          (item) => `<li>
      <span class="order__name">${item.name}</span>
      <span class="order__price">₦${item.price}</span>
    </li>`
        )
        .join("")}
      </ul>
      <div class="order__total">
        <span>Total:</span>
        <span>₦${data.total}</span>
      </div>`;
    this.renderMessage(chatMsg, true);
  }

  renderOrderHistory(orders) {
    const chatMsg = orders
      .map(
        (order) => `<div class="order__history">
      <h2>Order #${order.orderNo}</h2>
      ${order.order
        .map(
          (item) => `<div class="item">${item.name}</div>
      <div class="price">₦${item.price}</div>
      <div class="details">
        <span>Cuisine:</span> ${item.cuisine}<br />
        <span>Course:</span> ${item.course}
      </div>`
        )
        .join("")}
    </div>`
      )
      .join("");
    this.renderMessage(chatMsg, true);
  }
}

export default new Chat();
