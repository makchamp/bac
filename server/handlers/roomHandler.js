module.exports = (io, socket) => {
  const joinRoom = (payload) => {
    const { userName, roomName } = payload;
    if (roomName) {
      console.log(`${userName} is joining room ${roomName}`);
      socket.join(payload.RoomName);
    }
  }

  socket.on('room:join', joinRoom);
};