const registerRoomHandlers = require("./roomHandler");

module.exports = async (io, socket, store) => {
  const { sessionID, session } = socket.request;
  console.log(`socket connection established - sessionID: ${sessionID}`);
  registerRoomHandlers(io, socket, store);

  socket.on('disconnect', (socket) => {
    console.log(`Disconnected ${JSON.stringify(socket)}`);
  });
};