const start = 'game:start';
const timerEvent = 'game:timer';

function startGame(socket, data) {
  socket.emit(start, data);
}

export {
  timerEvent,
  startGame,
}