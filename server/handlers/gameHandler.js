module.exports = (io, socket, store) => {
  const { sessionID, session } = socket.request;
  const socketID = socket.id;

  const startGame = (payload) => {
    const {
      userName,
      roomName,
      gameSettings,
      categories
    } = payload;
    const {
      lengthOfRound,
      numOfRounds,
      numOfCategories
    } = gameSettings;

    store.client.hset(roomName, 'gameSettings', JSON.stringify(gameSettings));
    store.client.hset(
      roomName,
      'categories',
      JSON.stringify(selectCategories(categories, numOfCategories, numOfRounds)));
    store.client.hset(roomName, 'gameState', 'inRound');
    io.to(roomName).emit('game:stateChange', {gameState: 'inRound'});
    setRoundTimer(roomName, 30);

  }

  const setRoundTimer = (roomName, lengthOfRound) => {
    const interval = setInterval(roundIntervalHandler, 1000, roomName);
    setRoundTimeout(roomName, interval);
    store.client.hset(roomName, 'roundTime', lengthOfRound);
  }

  const clearRoundTimeout = (roomName) => {
    store.client.hget(roomName, 'roundTimeoutId',
      (error, roundTimeout) => {
        if (roundTimeout)
          clearInterval(roundTimeout);
      }
    );
  }

  const setRoundTimeout = (roomName, timeout) => {
    clearRoundTimeout(roomName);
    store.client.hset(roomName, 'roundTimeoutId', timeout[Symbol.toPrimitive]());
  }

  const roundIntervalHandler = (roomName) => {
    store.client.hget(roomName, 'roundTime', (error, time) => {
      let counter = parseInt(time);
      io.to(roomName).emit('game:timer', counter--);
      store.client.hset(roomName, 'roundTime', counter);
      if (counter < 0) {
        clearRoundTimeout(roomName);
        io.to(roomName).emit('game:stateChange', {gameState: 'inLobby'});
        store.client.hset(roomName, 'gameState', 'inLobby');
      }
    });
  }

  const selectCategories = (
    categories,
    numOfCategories,
    numOfRounds
  ) => {
    const active = categories.defaultCategories.flatMap(
      category => category.isActive ? [category.label] : []);

    //TODO: randomize & add custom categories
    return active.slice(0, numOfCategories);
  }

  socket.on('game:start', startGame);
};