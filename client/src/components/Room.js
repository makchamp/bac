import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import { useContext, useState, useEffect } from 'react';
import { SocketContext } from '../services/socket';
import { useNavigate, useParams } from 'react-router-dom';
import {
  userSetChanged,
  roomFullError,
  userInfoEvent,
  connectRoom,
} from '../services/roomService';
import {
  timerEvent,
  stateChangeEvent,
  startEvent,
  nextCategoryEvent,
  startGame,
  emitAnswer,
  emitNextCategory,
  emitVote,
  emitNextRound,
} from '../services/gameService';
import GameSettings from './GameSettings';
import PlayerList from './PlayerList';
import Round from './Round';
import { generateLetters } from './Letters';
import { generateCategories } from './Categories';
import { putObject, removeObject, fetchObject, keys } from '../services/storage';
import PostRound from './PostRound';
import Voting from './Voting';
import Loading from './Loading';
import { UIMessage } from '../models/UIMessage';
import { User } from '../models/User';
import {
  uniqueNamesGenerator,
  adjectives,
  animals,
} from 'unique-names-generator';
import { useUserStore } from '../services/state';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

const Room = ({ username }) => {
  const socket = useContext(SocketContext);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const params = useParams();

  const [users, setUsers] = useState([]);
  const [roomName, setRoomName] = useState('');
  const { currentUser, setCurrentUser } = useUserStore();

  useEffect(() => {
    const initRoom = () => {
      setLoading(true);
      const room = params.roomName;
      if (!room) {
        return navigate('/', { replace: true });
      }
      setRoomName(room);

      let usrName = username;
      if (!usrName) {
        const userLocalStore = fetchObject(keys.user);
        if (!userLocalStore?.userName) {
          // If no user create one with random name
          usrName = uniqueNamesGenerator({
            dictionaries: [adjectives, animals],
            separator: ' ',
            style: 'capital',
          });
        } else {
          usrName = userLocalStore.userName;
        }
        const userObj = { userName: usrName, roomName: room };
        setCurrentUser(userObj);
        putObject(keys.user, userObj);
      }
      if (!connectRoom(socket, { userName: usrName, roomName: room })) {
        return navigate('/', { replace: true });
      }
    };

    initRoom();
  }, [socket, username, roomName, params.roomName, navigate, setCurrentUser]);

  const [timer, setTimer] = useState('');
  const gameStates = {
    Lobby: 'Lobby',
    Round: 'Round',
    Voting: 'Voting',
    PostRound: 'PostRound',
  };
  const [gameState, setGameState] = useState({
    state: gameStates.Lobby,
    currentRound: 0,
  });
  const [answers, setAnswers] = useState([]);

  const defaultGameSettings = {
    numOfRounds: 3,
    lengthOfRound: 120,
    multiScoring: true,
    numOfCategories: 12,
    letters: generateLetters(),
    letterRotation: false,
    toggleAllCategories: true,
  };
  const [gameSettings, setSettings] = useState(defaultGameSettings);

  const [categories, setStateCategories] = useState({
    defaultCategories: generateCategories(true),
    customCategories: [],
  });
  const setGameSettings = (settings) => {
    setSettings(settings);
    putObject(keys.gameSettings, settings);
  };
  const setCategories = (categories) => {
    setStateCategories(categories);
    putObject(keys.categories, categories);
  };

  useEffect(() => {
    const loadCache = () => {
      const settings = fetchObject(keys.gameSettings);
      if (settings) {
        setGameSettings({ ...settings });
      }
      const ctgs = fetchObject(keys.categories);
      if (ctgs) {
        setStateCategories({ ...ctgs });
      }
    };

    loadCache();
  }, []);

  useEffect(() => {
    let mounted = true;
    const setUserChangeSocket = () => {
      socket.on(userSetChanged, (payload) => {
        if (mounted) {
          const { users, room, gameState } = payload;
          setUsers(users ? users : []);
          setRoomName(room ? room : '');
          setGameState(gameState);
          setLoading(false);
        }
      });
    };

    const setGameTimer = () => {
      socket.on(timerEvent, (seconds) => {
        if (mounted) setTimer(secondsToMinutes(seconds));
      });
    };

    const setGameStateListener = () => {
      socket.on(stateChangeEvent, (payload) => {
        if (mounted) {
          if (payload.state !== gameStates.Round) {
            setAnswers([]);
          }
          if (
            payload.event === startEvent ||
            payload.event === nextCategoryEvent
          ) {
            removeObject(keys.ratings);
          }
          setGameState(payload);
        }
      });
    };

    const handleRoomFullError = () => {
      socket.on(roomFullError, (payload) => {
        if (mounted) {
          navigate('/', {
            replace: true,
            state: {
              uiMessage: new UIMessage(
                true,
                `Room '${roomName}' is full ! Please join another room.`
              ),
            },
          });
        }
      });
    };

    const handleRecieveUserInfo = () => {
      socket.on(userInfoEvent, (userInfo) => {
        if (mounted) {
          if (userInfo) {
            setCurrentUser(new User({ ...userInfo }));
          }
        }
      });
    };

    handleRoomFullError();
    handleRecieveUserInfo();
    setUserChangeSocket();
    setGameTimer();
    setGameStateListener();
    return () => {
      mounted = false;
    };
  }, [
    socket,
    answers,
    gameStates.Lobby,
    gameStates.Round,
    gameStates.PostRound,
    gameStates.Voting,
    roomName,
    navigate,
    setCurrentUser,
  ]);

  const resetGameSettings = () => {
    setGameSettings(defaultGameSettings);
    setCategories({
      defaultCategories: generateCategories(true),
      customCategories: [],
    });
  };

  const gameSettingsParams = {
    gameSettings,
    setGameSettings,
    categories,
    setCategories,
    resetGameSettings,
  };

  const secondsToMinutes = (seconds) => {
    let sec = parseInt(seconds);
    let dateTime = new Date(null);
    dateTime.setSeconds(sec);
    return dateTime.toISOString().substr(15, 4);
  };

  const setGameStart = () => {
    const { userName } = currentUser;
    startGame(socket, {
      userName,
      roomName,
      gameSettings,
      categories,
    });
  };

  const saveAnswer = (index, value) => {
    const ans =
      answers.length === 0
        ? gameState.categories[gameState.currentRound]
        : answers;
    ans[index].answer = value;
    emitAnswer(socket, { roomName, index, value });
    setAnswers(ans);
  };

  const vote = (answID, value) => {
    emitVote(socket, { roomName, answID, vote: value });
  };

  const nextCategory = () => {
    emitNextCategory(socket, { roomName });
  };

  const nextRound = () => {
    emitNextRound(socket, { roomName });
  };

  const renderGameState = (state) => {
    switch (state) {
      case gameStates.Lobby:
        return <GameSettings {...gameSettingsParams}></GameSettings>;
      case gameStates.Round:
        return (
          <Round
            timer={timer}
            gameState={gameState}
            saveAnswer={saveAnswer}></Round>
        );
      case gameStates.Voting:
        return (
          <Voting
            gameState={gameState}
            nextCategory={nextCategory}
            vote={vote}></Voting>
        );
      case gameStates.PostRound:
        return (
          <PostRound
            gameState={gameState}
            users={users}
            nextRound={nextRound}></PostRound>
        );
      default:
        return <GameSettings {...gameSettingsParams}></GameSettings>;
    }
  };

  return (
    <Grid container component='main' sx={{ height: '100vh' }}>
      {loading ? (
        <Loading />
      ) : (
        <>
          <Grid
            item
            xs={12}
            sm={12}
            md={8}
            sx={{ maxHeight: '100vh', overflow: 'auto' }}>
            {renderGameState(gameState.state)}
            {gameState.state === gameStates.Lobby && currentUser.isHost && (
              <Button
                variant='contained'
                size='large'
                color='success'
                onClick={() => setGameStart()}
                sx={{
                  ml: '40%',
                  mr: '40%',
                  mb: '10%',
                  height: '50px',
                  p: 2,
                }}
                startIcon={<PlayArrowIcon />}>
                Start Game!
              </Button>
            )}
          </Grid>
          <PlayerList users={users} roomName={roomName}></PlayerList>
        </>
      )}
    </Grid>
  );
};

export default Room;
