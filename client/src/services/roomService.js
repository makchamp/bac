const join = 'room:join';
const userSetChanged = 'room:userSetChanged';
const roomFullError = 'user:JoinRoomError:RoomFull';

function connectRoom(socket, data) {
  if (!data?.userName || !data?.roomName) {
    return false; 
  }
  socket.emit(join, data);
  return true;
}

export { userSetChanged, roomFullError, connectRoom };
