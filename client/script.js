import { io } from "socket.io-client";

const socket = io("http://127.0.0.1:8080/");

socket.io.on("error", (error) => {
  console.log(error.message || error);
});

socket.on("connect", () => {
  console.log(socket.id);
});
