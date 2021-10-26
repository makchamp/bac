const start = 'game:start';

function startGame(socket, data) {
  socket.emit(start, data);
}

export {
  startGame,
}