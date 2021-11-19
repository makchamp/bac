const { nanoid } = require('nanoid/non-secure');

module.exports = (io, socket, store) => {
  const { sessionID, session } = socket.request;

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
      currentRound: 0,
      numOfRounds,
      lengthOfRound,
      categories: selectedCategories,
      letterRotation,
      multiScoring,
      answers: {}
    }
    setGameState(roomName, gameState);
    delete gameState.answers;
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
          compileAnswers(roomName, gs);
          io.to(roomName).emit('game:stateChange', gs);
          setGameState(roomName, gs);
        });

      }
    });
  }

  const setGameState = (roomName, state) => {
    store.client.hset(roomName, 'gameState', JSON.stringify(state));
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
          category: selectedCategories[j],
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
    const idx = Math.floor((Math.random() * letters.length));
    return letters[idx];
  }

  const handleAnswer = (payload) => {
    const {
      roomName,
      index,
      value
    } = payload;
    store.client.hget(roomName, 'gameState', (error, gameState) => {
      try {
        const state = JSON.parse(gameState);
        const { currentRound, numOfRounds, answers, categories } = state;

        if (!answers[sessionID]) {
          const numOfCategories = categories[currentRound].length;
          answers[sessionID] = Array.from(
            Array(numOfRounds),
            () => new Array(numOfCategories).fill(null).map(
              () => ({ answID: nanoid(12) }))
          );
        }
        answers[sessionID][currentRound][index].answ = value;
        setGameState(roomName, state);
      }
      catch (error) {
        console.error(error);
      }
    });
  }

  const compileAnswers = (roomName, state) => {
    const { currentRound, answers, categories } = state;
    const users = Object.keys(answers);
    categories[currentRound].forEach((category, index) => {
      const categoryAns = [];
      users.forEach(user => {
        const ans = answers[user][currentRound][index];
        categoryAns.push(ans);
      });
      category.answers = categoryAns;
    });
    state.state = 'inVoting';
    state.currentCategory = 0;
    io.to(roomName).emit('game:stateChange', state);
    setGameState(roomName, state);
  }

  const nextCategory = (payload) => {
    const { roomName } = payload;
    store.client.hget(roomName, 'gameState', (error, gameState) => {
      const state = JSON.parse(gameState);
      const { currentRound, currentCategory, categories } = state;
      if (currentCategory < categories[currentRound].length - 1) {
        state.currentCategory++;
      }
      else {
        state.state = 'inLobby';
      }
      setGameState(roomName, state);
      io.to(roomName).emit('game:stateChange', state);
    });
  }

  const castVote = (votes) => {
    if (!votes) {
      votes = [sessionID];
    }
    else {
      const idx = votes.indexOf(sessionID);
      idx === -1 ? votes.push(sessionID) : votes.splice(idx, 1);
    }
    return votes;
  }

  const unCastVote = (votes) => {
    if (votes) {
      const idx = votes.indexOf(sessionID);
      if (idx > -1) {
        votes.splice(idx, 1);
      }
    }
    return votes;
  }

  const tallyAnswer = (upvotes, downvotes) => {
    const numUpvotes = upvotes ? upvotes.length : 0;
    const numDownvotes = downvotes? downvotes.length : 0;

    const score = numUpvotes - numDownvotes;
    return score; 
  }

  const hanldeVote = (payload) => {
    const { answID, vote } = payload;
    const roomName = session.room
    store.client.hget(roomName, 'gameState', (error, gameState) => {
      const state = JSON.parse(gameState);
      const { currentRound, currentCategory, categories, answers } = state;

      const ctg = categories[currentRound][currentCategory];

      const playerAnswers = Object.keys(answers);
      for (let i = 0; i < playerAnswers.length; i++) {
        const playerID = playerAnswers[i];
        const answer = answers[playerID][currentRound][currentCategory];
        if (sessionID !== playerID && answer.answID === answID) {

          if (vote.label === 'upvote') {
            answer.upvotes = castVote(answer.upvotes);
            answer.downvotes = unCastVote(answer.downvotes);
          }
          else {
            answer.downvotes = castVote(answer.downvotes);
            answer.upvotes = unCastVote(answer.upvotes);
          }
          
          const idx = ctg.answers.findIndex(ans => ans.answID === answID);
          ctg.answers[idx].score = tallyAnswer(answer.upvotes, answer.downvotes);
          break;
        }
      }
      setGameState(roomName, state);
      io.to(roomName).emit('game:stateChange', state);
    });
  }

  socket.on('game:start', startGame);
  socket.on('game:answer', handleAnswer);
  socket.on('game:nextCategory', nextCategory);
  socket.on('game:vote', hanldeVote);
};