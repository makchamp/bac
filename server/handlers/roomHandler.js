const rooms = {};

module.exports = (io, socket, store) => {
  const joinRoom = (payload) => {
    const { userName, roomName } = payload;
    const userID = socket.id;
    if (roomName) {
      console.log(`User \'${userName}\' (${socket.id}) is joining Room \'${roomName}\'`);
      socket.join(roomName);

      // Save users in memory
      if (rooms[roomName]) {
        rooms[roomName].users[userID] = {
          userName,
          isHost: false
        }
      }
      else {
        rooms[roomName] = {
          users: {}
        }
        rooms[roomName].users[userID] = {
          userName,
          isHost: true
        }
      }
      notifyUserSetChanged(roomName);
    }
  }

  const notifyUserSetChanged = (roomName) => {
    // Update client with room info
    const room = rooms[roomName];
    if (!room) return;
    const users = Object.keys(room.users).map((key) =>
      ({ 
        userName: room.users[key].userName,
        isHost: room.users[key].isHost 
      })
    );

    io.to(roomName).emit('room:userSetChanged', {
      room: roomName,
      users,
    });
  }


  const leaveRoom = () => {
    const roomsToRemove = [];
    // Delete users from memory
    for (const [key, value] of Object.entries(rooms)) {
      delete value.users[socket.id];
      notifyUserSetChanged(key);

      // If the room is empty, also delete it
      if (Object.keys(value.users).length === 0) {
        roomsToRemove.push(key);
      }
    }
    for (const room in roomsToRemove) {
      delete rooms[roomsToRemove[room]];
    }
  }

  socket.on('room:join', joinRoom);
  socket.on('disconnecting', leaveRoom);
};