const { nanoid } = require('nanoid/non-secure');
import { RoomState } from '../models/RoomState.enum';
import { StoreTimer } from '../models/StoreTimer';

export default function registerGameHandlers(io, socket, store) {
  const { sessionID, session } = socket.request; // sessionID === userID

  const roundTimer = new StoreTimer(
    store,
    'roundIntervalId',
    'roundTime',
    io,
    'game:timer'
  );

  const startGame = (payload) => {
    const { userName, roomName, gameSettings, categories } = payload;
    const {
      lengthOfRound,
      numOfRounds,
      numOfCategories,
      letters,
      letterRotation,
      multiScoring,
    } = gameSettings;

    store.client.hset(roomName, 'gameSettings', JSON.stringify(gameSettings));
    const gameState = {
      state: RoomState.Round,
      currentRound: 0,
      numOfRounds,
      lengthOfRound,
      categories: [],
      letterRotation,
      multiScoring,
      players: {},
      answers: {},
      event: 'game:start',
    };

    store.client.hget(roomName, 'users', (err, roomUsers) => {
      if (roomUsers) {
        // Setup players, categories and answers/scores table
        gameState.players = JSON.parse(roomUsers);
        gameState.categories = selectCategories(
          categories,
          numOfCategories,
          letters,
          letterRotation,
          numOfRounds
        );
        initAnswersTable(gameState);
        setGameState(roomName, gameState);
        emitGameState(roomName, gameState);
        setRoundTimer(roomName, lengthOfRound);
      }
    });
  };

  const initAnswersTable = (gameState) => {
    for (const playerId in gameState.players) {
      const numOfCategories =
        gameState.categories[gameState.currentRound].length;
      gameState.answers[playerId] = {
        answers: Array.from(Array(gameState.numOfRounds), () =>
          new Array(numOfCategories)
            .fill(null)
            .map(() => ({ answID: nanoid(12) }))
        ),
        scores: {
          rounds: Array(gameState.numOfRounds).fill(0),
          total: 0,
        },
      };
    }
  };

  const setRoundTimer = (roomName, lengthOfRound) => {
    roundTimer.setIntervalTimer(roomName, lengthOfRound, (roomName) => {
      store.client.hget(roomName, 'gameState', (error, gameState) => {
        let gs = JSON.parse(gameState);
        compileAnswers(roomName, gs);
        gs.state = RoomState.Voting;
        gs.currentCategory = 0;

        setGameState(roomName, gs);
        emitGameState(roomName, gs);
      });
    });
  };

  const setGameState = (roomName, state) => {
    store.client.hset(roomName, 'gameState', JSON.stringify(state));
  };

  const emitGameState = (roomName, state) => {
    io.to(roomName).emit('game:stateChange', state);
  };

  const selectCategories = (
    categories,
    numOfCategories,
    letters,
    letterRotation,
    numOfRounds
  ) => {
    const activeCategories = categories.defaultCategories.flatMap((category) =>
      category.isActive ? [category.label] : []
    );
    const activeLetters = Object.keys(letters).flatMap((letter) =>
      letters[letter].isActive ? [letter] : []
    );

    let selectedLetter = selectRandomLetter(activeLetters);
    const res = new Array(numOfRounds);
    for (let i = 0; i < res.length; i++) {
      const selectedCategories = selectRandomCategories(
        activeCategories,
        numOfCategories
      );
      const ctgs = new Array(numOfCategories);
      for (let j = 0; j < numOfCategories; j++) {
        const letter = letterRotation
          ? selectRandomLetter(activeLetters)
          : selectedLetter;
        ctgs[j] = {
          letter,
          category: selectedCategories[j],
        };
      }
      res[i] = ctgs;
    }
    return res;
  };

  const selectRandomCategories = (arr, n) => {
    let len = arr.length;
    const res = new Array(n);
    const taken = new Array(len);
    if (n > len) throw new RangeError('Range Error');
    while (n--) {
      var x = Math.floor(Math.random() * len);
      res[n] = arr[x in taken ? taken[x] : x];
      taken[x] = --len in taken ? taken[len] : len;
    }
    return res;
  };

  const selectRandomLetter = (letters) => {
    const idx = Math.floor(Math.random() * letters.length);
    return letters[idx];
  };

  const handleAnswer = (payload) => {
    const { roomName, index, value } = payload;
    store.client.hget(roomName, 'gameState', (error, gameState) => {
      try {
        const state = JSON.parse(gameState);
        const { currentRound, answers } = state;
        answers[sessionID].answers[currentRound][index].answ = value;
        setGameState(roomName, state);
      } catch (error) {
        console.error(error);
      }
    });
  };

  const compileAnswers = (roomName, state) => {
    const { currentRound, answers, categories } = state;
    const users = Object.keys(answers);
    categories[currentRound].forEach((category, index) => {
      const categoryAns = [];
      users.forEach((user) => {
        const ans = answers[user].answers[currentRound][index];
        categoryAns.push(ans);
      });
      category.answers = categoryAns;
    });
    emitGameState(roomName, state);
    setGameState(roomName, state);
  };

  const nextCategory = (payload) => {
    const { roomName } = payload;
    store.client.hget(roomName, 'gameState', (error, gameState) => {
      const state = JSON.parse(gameState);
      const { currentRound, currentCategory, categories, answers } = state;

      if (currentCategory < categories[currentRound].length - 1) {
        state.currentCategory++;
        state.event = 'game:nextCategory';
        RoomState.Round;
      } else {
        state.currentCategory = 0;
        state.state = RoomState.PostRound;
      }
      setGameState(roomName, state);
      io.to(roomName).emit('game:stateChange', state);
    });
  };

  const castVote = (votes) => {
    if (!votes) {
      votes = [sessionID];
    } else {
      const idx = votes.indexOf(sessionID);
      idx === -1 ? votes.push(sessionID) : votes.splice(idx, 1);
    }
    return votes;
  };

  const unCastVote = (votes) => {
    if (votes) {
      const idx = votes.indexOf(sessionID);
      if (idx > -1) {
        votes.splice(idx, 1);
      }
    }
    return votes;
  };

  const tallyAnswer = (upvotes, downvotes) => {
    const numUpvotes = upvotes ? upvotes.length : 0;
    const numDownvotes = downvotes ? downvotes.length : 0;

    const score = numUpvotes - numDownvotes;
    return score;
  };

  const hanldeVote = (payload) => {
    const { roomName, answID, vote } = payload;
    store.client.hget(roomName, 'gameState', (error, gameState) => {
      const state = JSON.parse(gameState);
      const {
        currentRound,
        currentCategory,
        categories,
        answers,
        numOfRounds,
      } = state;

      const ctg = categories[currentRound][currentCategory];

      const playerAnswers = Object.keys(answers);
      for (let i = 0; i < playerAnswers.length; i++) {
        const playerID = playerAnswers[i];
        const answer = answers[playerID].answers[currentRound][currentCategory];
        if (sessionID !== playerID && answer.answID === answID && answer.answ) {
          if (vote.label === 'upvote') {
            answer.upvotes = castVote(answer.upvotes);
            answer.downvotes = unCastVote(answer.downvotes);
          } else {
            answer.downvotes = castVote(answer.downvotes);
            answer.upvotes = unCastVote(answer.upvotes);
          }

          const idx = ctg.answers.findIndex((ans) => ans.answID === answID);
          const score = tallyAnswer(answer.upvotes, answer.downvotes);
          ctg.answers[idx].score = score;
          answer.score = score;
          sumPlayerRoundScores(answers, playerID, currentRound);
          break;
        }
      }
      setGameState(roomName, state);
      state.event = 'game:vote';
      io.to(roomName).emit('game:stateChange', state);
    });
  };

  function sumPlayerRoundScores(answersTable, playerID, currentRound) {
    let score = 0;
    answersTable[playerID].answers[currentRound].forEach((ans, idx) => {
      if (ans.score) {
        score += ans.score;
      }
    });
    answersTable[playerID].scores.rounds[currentRound] = score;
    // sum total score
    answersTable[playerID].scores.total = answersTable[
      playerID
    ].scores.rounds.reduce((a, b) => a + b, 0);
  }

  const nextRound = (payload) => {
    const { roomName } = payload;
    store.client.hget(roomName, 'gameState', (error, gameState) => {
      const state = JSON.parse(gameState);
      const { currentRound, numOfRounds } = state;
      if (currentRound < numOfRounds - 1) {
        state.currentRound++;
        state.state = RoomState.Round;
      } else {
        state.state = RoomState.Lobby;
      }
      setGameState(roomName, state);
      state.event = 'game:nextRound';
      io.to(roomName).emit('game:stateChange', state);
      if (state.state === RoomState.Round) {
        setRoundTimer(roomName, state.lengthOfRound);
      }
    });
  };

  socket.on('game:start', startGame);
  socket.on('game:answer', handleAnswer);
  socket.on('game:nextCategory', nextCategory);
  socket.on('game:nextRound', nextRound);
  socket.on('game:vote', hanldeVote);
}
