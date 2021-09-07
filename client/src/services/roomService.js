const join = 'room:join';
const userSetChanged = 'room:userSetChanged';

function connectRoom(socket, data) {
  console.log(`${data.userName} joined room ${data.roomName}`);
  socket.emit(join, data);
}

export {
  userSetChanged,
  connectRoom,
}