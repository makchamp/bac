const startEvent = 'game:start';
const timerEvent = 'game:timer';
const answerEvent = 'game:answer';
const stateChangeEvent = 'game:stateChange';
const nextCategoryEvent = 'game:nextCategory';
const nextRoundEvent = 'game:nextRound';
const voteEvent = 'game:vote';
const gameSettingsEvent = 'game:settings';
const resetGameSettingsEvent = 'game:resetSettings';

function startGame(socket, data) {
  socket.emit(startEvent, data);
}

function emitAnswer(socket, data) {
  socket.emit(answerEvent, data);
}

function emitNextCategory(socket, data) {
  socket.emit(nextCategoryEvent, data);
}

function emitVote(socket, data) {
  socket.emit(voteEvent, data);
}

function emitNextRound(socket, data) {
  socket.emit(nextRoundEvent, data);
}

function emitGameSettings(socket, data) {
  socket.emit(gameSettingsEvent, data);
}

function emitResetGameSettings(socket, data) {
  socket.emit(resetGameSettingsEvent, data);
}

export {
  startEvent,
  timerEvent,
  stateChangeEvent,
  nextCategoryEvent,
  nextRoundEvent,
  voteEvent,
  gameSettingsEvent,
  resetGameSettingsEvent,
  startGame,
  emitAnswer,
  emitNextCategory,
  emitVote,
  emitNextRound,
  emitGameSettings,
  emitResetGameSettings
};
