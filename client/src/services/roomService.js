
async function connectRoom(socket, data) {
  console.log(JSON.stringify(data));
  console.log(`${data.userName} joined room ${data.roomName}`);
  socket.emit('room:join', data);
}

export {
  connectRoom,
}