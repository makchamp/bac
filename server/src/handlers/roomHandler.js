import { RoomState } from '../models/RoomState.enum';
import { StoreTimer } from '../models/StoreTimer';

const MAX_ROOM_SIZE = 16;
const TIME_TO_DELETE_ROOM = 60 * 5; // seconds

export default function registerRoomHandlers(io, socket, store) {
  const { sessionID, session } = socket.request;
  const socketID = socket.id;

  const deleteRoomTimer = new StoreTimer(
    store,
    'deleteRoomIntervalId',
    'timeToDeleteRoom'
  );

  const joinRoom = (payload) => {
    const { userName, roomName } = payload;
    if (roomName) {
      deleteRoomTimer.clearIntervalTimer(roomName);
      try {
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
      } catch (err) {
        console.log(
          `Error attempting to join user: \'${sessionID}\' to room ${roomName}`
        );
        store.client.hget(roomName, 'users', (err, roomUsers) => {
          if (isRoomEmpty(roomUsers)) {
            setDeleteRoomTimer(roomName);
          }
        });
      }
    }
  };

  const setDeleteRoomTimer = (roomName) => {
    deleteRoomTimer.setIntervalTimer(
      roomName,
      TIME_TO_DELETE_ROOM,
      (roomName) => {
        store.client.hget(roomName, 'users', (err, roomUsers) => {
          // Make sure theres nobody in the room before deleting it
          if (isRoomEmpty(roomUsers)) {
            deleteRoom(roomName);
          }
        });
      }
    );
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
            if (leavingUser) {
              leavingUser.socketID = null;
              notifyUserSetChanged(roomName, users);
              store.client.hset(roomName, 'users', JSON.stringify(users));
              if (getConnectedUsersCount(users) === 0) {
                // Start timer to delete room
                setDeleteRoomTimer(roomName);
              }
            }
          }
        });
      }
    });
  };

  const getConnectedUsersCount = (users) => {
    return Object.values(users).filter((user) => user.socketID).length;
  };

  const deleteRoom = (roomName) => {
    store.client.del(roomName, (error, res) => {
      if (error) {
        console.error(`Failed to delete redis key ${roomName}`, err);
      }
    });
  };

  const isRoomEmpty = (roomUsers) => {
    return !roomUsers || getConnectedUsersCount(JSON.parse(roomUsers)) === 0;
  };

  socket.on('room:join', joinRoom);
  socket.on('disconnecting', leaveRoom);
}
