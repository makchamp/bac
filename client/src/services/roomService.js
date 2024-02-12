const join = 'room:join';
const userSetChanged = 'room:userSetChanged';
const roomFullError = 'user:JoinRoomError:RoomFull';
const userInfoEvent = 'user:Info';

function connectRoom(socket, data) {
  if (!data?.userName || !data?.roomName) {
    return false;
  }
  socket.emit(join, data);
  return true;
}

export { userSetChanged, roomFullError, userInfoEvent, connectRoom };
