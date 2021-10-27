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
      numOfCategories,
      letters,
      letterRotation,
      multiScoring
    } = gameSettings;

    store.client.hset(roomName, 'gameSettings', JSON.stringify(gameSettings));
    const selectedCategories = selectCategories(
      categories,
      numOfCategories,
      letters,
      letterRotation,
      numOfRounds
    );
    store.client.hset(
      roomName,
      'categories',
      JSON.stringify(selectedCategories));


    let gameState = {
      state: 'inRound',
      currentRound: 1,
      lengthOfRound,
      categories: selectedCategories,
      letterRotation,
      multiScoring
    }
    store.client.hset(roomName, 'gameState', JSON.stringify(gameState));
    io.to(roomName).emit('game:stateChange', gameState);
    setRoundTimer(roomName, lengthOfRound);
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
        store.client.hget(roomName, 'gameState', (error, gameState) => {
          let gs = JSON.parse(gameState);
          gs = { ...gs, state: 'inLobby' };
          io.to(roomName).emit('game:stateChange', gs);
          store.client.hset(roomName, 'gameState', JSON.stringify(gs));
        });

      }
    });
  }

  const selectCategories = (
    categories,
    numOfCategories,
    letters,
    letterRotation,
    numOfRounds,
  ) => {
    const activeCategories = categories.defaultCategories.flatMap(
      category => category.isActive ? [category.label] : []);
    const activeLetters = Object.keys(letters).flatMap(
      letter => letters[letter].isActive ? [letter] : []);
    const selectedCategories = selectRandomCategories(activeCategories, numOfCategories);
    let selectedLetter = selectRandomLetter(activeLetters);

    const res = new Array(numOfRounds);
    for (let i = 0; i < res.length; i++) {
      const ctgs = new Array(numOfCategories);
      selectedLetter = selectRandomLetter(activeLetters);
      for (let j = 0; j < numOfCategories; j++) {
        const letter = letterRotation ? selectRandomLetter(activeLetters) : selectedLetter;
        ctgs[j] = {
          letter,
          category: selectedCategories[j]
        };
      }
      res[i] = ctgs;
    }

    return res;
  }

  const selectRandomCategories = (arr, n) => {
    let len = arr.length;
    const res = new Array(n);
    const taken = new Array(len);
    if (n > len)
      throw new RangeError("Range Error");
    while (n--) {
      var x = Math.floor(Math.random() * len);
      res[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return res;
  }

  const selectRandomLetter = (letters) => {
    const idx = Math.floor((Math.random() * letters.length - 1));
    return letters[idx];
  }

  socket.on('game:start', startGame);
};