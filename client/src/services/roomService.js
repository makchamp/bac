const join = 'room:join';
const userSetChanged = 'room:userSetChanged';
const roomFullError = 'user:JoinRoomError:RoomFull';
const userJoinEvent = 'user:Join';

function connectRoom(socket, data) {
  if (!data?.userName || !data?.roomName) {
    return false;
  }
  socket.emit(join, data);
  return true;
}

export { userSetChanged, roomFullError, userJoinEvent, connectRoom };
