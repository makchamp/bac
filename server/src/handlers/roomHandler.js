import { RoomState } from '../models/RoomState.enum';

const MAX_ROOM_SIZE = 10;

export default function registerRoomHandlers(io, socket, store) {
  const { sessionID, session } = socket.request;
  const socketID = socket.id;

  const joinRoom = (payload) => {
    const { userName, roomName } = payload;
    if (roomName) {
      socket.join(roomName);
      console.log(`User \'${sessionID}\' joined room \'${session.room}\'`);
      store.client.hget(roomName, 'users', (err, roomUsers) => {
        let users;
        if (roomUsers) {
          users = JSON.parse(roomUsers);
          if (
            Object.keys(users).length === MAX_ROOM_SIZE &&
            !users[sessionID]
          ) {
            return notifyUser(
              'user:JoinRoomError:RoomFull',
              `Reached max number of users in room '${roomName}'`
            );
          }
          users[sessionID] = {
            userName,
            socketID,
            isHost: users[sessionID] && users[sessionID].isHost,
          };
        } else {
          users = {};
          users[sessionID] = {
            userName,
            socketID,
            isHost: true,
          };
          store.client.hset(
            roomName,
            'gameState',
            JSON.stringify({ state: RoomState.Lobby })
          );
        }
        store.client.hset(roomName, 'users', JSON.stringify(users));
        store.get(sessionID, (error, session) => {
          if (session) {
            store.set(sessionID, { ...session, room: roomName });
          }
        });
        notifyUserSetChanged(roomName, users);
      });
    }
  };

  const notifyUser = (event, msg) => {
    socket.emit(event, msg);
  };

  const notifyUserSetChanged = (roomName, users) => {
    // Update client with room info
    if (!users) return;
    const userList = Object.keys(users).map((key) => ({
      userID: key,
      userName: users[key].userName,
      isHost: users[key].isHost,
      inRoom: users[key].socketID ? true : false,
    }));

    store.client.hget(roomName, 'gameState', (error, gameState) => {
      io.to(roomName).emit('room:userSetChanged', {
        room: roomName,
        users: userList,
        gameState: JSON.parse(gameState),
      });
    });
  };

  const leaveRoom = () => {
    store.get(sessionID, (error, session) => {
      if (!error && session) {
        const roomName = session.room;
        store.client.hget(roomName, 'users', (err, roomUsers) => {
          if (roomUsers) {
            let users = JSON.parse(roomUsers);
            const leavingUser = users[sessionID];
            if (leavingUser && leavingUser.socketID === socketID) {
              leavingUser.socketID = null;
              notifyUserSetChanged(roomName, users);
              store.client.hset(roomName, 'users', JSON.stringify(users));
            }
          }
        });
      }
    });
  };

  socket.on('room:join', joinRoom);
  socket.on('disconnecting', leaveRoom);
}
