import { io } from "socket.io-client";

const socket = io("http://127.0.0.1:8080/");

socket.io.on("error", (error) => {
  console.log(error.message || error);
});

socket.on("connect", () => {
  console.log(socket.id);
});

socket.on("sendOptions", (options) => {
  displayOptions(options);
});

function displayOptions(options) {
  const chatSpace = document.getElementById("chat__space");
  const chatCon = document.createElement("div");
  chatCon.className = "chat__con chat__con-bot";
  const chatInfo = document.createElement("div");
  chatInfo.className = "chat__bot";
  chatInfo.innerHTML =
    '<img src="./bot.jpg" alt="Bot pic" /><span>FoodieBot</span><span>13:45</span>';
  const chatBubble = document.createElement("div");
  chatBubble.className = "chat__bubble";
  const chatMsg = `<ul>${options
    .map((opt) => `<li>${opt}</li>`)
    .join("")}</ul>`;
  chatBubble.innerHTML = chatMsg;
  chatCon.insertAdjacentElement("beforeend", chatInfo);
  chatCon.insertAdjacentElement("beforeend", chatBubble);
  chatSpace.insertAdjacentElement("beforeend", chatCon);
  //   Save to DB
  socket.emit("saveChat", { message: chatMsg, isBotMsg: true });
}
