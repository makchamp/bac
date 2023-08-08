import registerRoomHandlers from './roomHandler';
import registerGameHandlers from './gameHandler';

export default async function setUpHandlers(io: any, socket: any, store: any) {
  const { sessionID } = socket.request;
  console.log(`socket connection established - sessionID: ${sessionID}`);

  registerRoomHandlers(io, socket, store);
  registerGameHandlers(io, socket, store);

  socket.on('disconnect', (socket) => {
    console.log(`Disconnected ${JSON.stringify(socket)}`);
  });
}
