// Function to save to session
exports.saveToSession = (session) => {
  session.save(function (err) {
    if (err) {
      console.log(err);
    }
  });
};

exports.emitBotResponseEvent = (socket, type, data) => {
  socket.emit("botResponse", {
    type,
    data,
  });
};
