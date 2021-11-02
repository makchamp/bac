const startEvent = 'game:start';
const timerEvent = 'game:timer';
const answerEvent = 'game:answer'
const stateChangeEvent = 'game:stateChange'

function startGame(socket, data) {
  socket.emit(startEvent, data);
}

function emitAnswer(socket, data) {
  socket.emit(answerEvent, data);
}

export {
  timerEvent,
  stateChangeEvent,
  startGame,
  emitAnswer,
}