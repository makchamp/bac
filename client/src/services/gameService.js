const startEvent = 'game:start';
const timerEvent = 'game:timer';
const answerEvent = 'game:answer';
const stateChangeEvent = 'game:stateChange';
const nextCategoryEvent = 'game:nextCategory';

function startGame(socket, data) {
  socket.emit(startEvent, data);
}

function emitAnswer(socket, data) {
  socket.emit(answerEvent, data);
}

function emitNextCategory(socket, data) {
  socket.emit(nextCategoryEvent, data);
}

export {
  timerEvent,
  stateChangeEvent,
  startGame,
  emitAnswer,
  emitNextCategory,
}