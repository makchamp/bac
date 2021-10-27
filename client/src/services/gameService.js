const startEvent = 'game:start';
const timerEvent = 'game:timer';
const stateChangeEvent = 'game:stateChange'

function startGame(socket, data) {
  socket.emit(startEvent, data);
}

export {
  timerEvent,
  stateChangeEvent,
  startGame,
}