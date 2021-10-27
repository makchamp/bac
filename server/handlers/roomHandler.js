module.exports = (io, socket, store) => {
  const { sessionID, session } = socket.request;
  const socketID = socket.id;

  const joinRoom = (payload) => {
    const { userName, roomName } = payload;
    if (roomName) {
      console.log(`User \'${userName}\' (${socketID}) is joining Room \'${roomName}\'`);
      socket.join(roomName);
      console.log(socket.rooms);
      store.client.hgetall(roomName, (err, room) => {
        let users;
        if (room) {
          users = JSON.parse(room.users);
          users[sessionID] = {
            userName,
            socketID,
            isHost: users[sessionID] && users[sessionID].isHost,
          };
        }
        else {
          users = {};
          users[sessionID] = {
            userName,
            socketID,
            isHost: true,
          };
          store.client.hset(roomName, 'gameState', JSON.stringify({state: 'inLobby'}));
        }
        notifyUserSetChanged(roomName, users);
        store.client.hset(roomName, 'users', JSON.stringify(users));
        store.get(sessionID, (error, session) => {
          if (session){
            store.set(sessionID, { ...session, room: roomName });
          }
        });
      });
    }
  }

  const notifyUserSetChanged = (roomName, users) => {
    // Update client with room info
    if (!users) return;
    const userList = Object.keys(users).map((key) =>
    ({
      userName: users[key].userName,
      isHost: users[key].isHost,
      inRoom: users[key].socketID ? true : false
    }));

    store.client.hget(roomName, 'gameState', 
      (error, gameState) => {
        io.to(roomName).emit('room:userSetChanged', {
          room: roomName,
          users: userList,
          gameState: JSON.parse(gameState)
        });
      });

  }

  const leaveRoom = () => {
    store.get(sessionID, (error, session) => {
      if (!error && session) {
        const roomName = session.room;
        store.client.hgetall(roomName, (err, room) => {
          if (room && room.users) {
            let users = JSON.parse(room.users);
            const leavingUser = users[sessionID];
            if (leavingUser.socketID === socketID) {
              leavingUser.socketID = null;
              notifyUserSetChanged(roomName, users);
              store.client.hset(roomName, 'users', JSON.stringify(users));
            }
          }
        });
      }
    });
  }

  socket.on('room:join', joinRoom);
  socket.on('disconnecting', leaveRoom);
};