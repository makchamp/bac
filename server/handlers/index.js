const registerRoomHandlers = require("./roomHandler");

module.exports = (io, socket) => {
  console.log("connection established");
  registerRoomHandlers(io, socket);

  socket.on('disconnect', (socket) => {
    console.log(`Disconnected ${JSON.stringify(socket)}`);
  });
};