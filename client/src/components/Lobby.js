import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useContext, useState, useEffect } from 'react'
import { SocketContext } from '../services/socket';
import { userSetChanged } from '../services/roomService';
import GameSettings from './GameSettings';
import { generateLetters } from './Letters';
import { generateCategories } from './Categories';
import { putObject, fetchObject, keys } from '../services/cache';

const Lobby = () => {
  const socket = useContext(SocketContext);
  const [users, setUsers] = useState([]);
  const [room, setRoom] = useState('');
  const defaultGameSettings = {
    numOfRounds: 3,
    lengthOfRound: 120,
    multiScoring: true,
    numOfCategories: 12,
    letters: generateLetters(),
    letterRotation: false,
    toggleAllCategories: true,
  }
  const [gameSettings, setSettings] = useState(defaultGameSettings);

  const [categories, setStateCategories] = useState({
    defaultCategories: generateCategories(true),
    customCategories: [],
  })
  const setGameSettings = (settings) => {
    setSettings(settings);
    putObject(keys.gameSettings, settings);
  }
  const setCategories = (categories) => {
    setStateCategories(categories);
    putObject(keys.categories, categories);
  }

  useEffect(() => {
    const setUserChangeSocket = () => {
      socket.on(userSetChanged, (payload) => {
        setUsers(payload.users);
        setRoom(payload.room);
      });
    }

    const loadCache = () => {
      const settings = fetchObject(keys.gameSettings);
      if (settings) {
        setGameSettings({ ...settings });
      }
      const ctgs = fetchObject(keys.categories);
      if (ctgs) {
        setStateCategories({ ...ctgs });
      }
    }
    loadCache();
    setUserChangeSocket();
  }, [socket]);

  const resetGameSettings = () => {
    console.log("resetting settings")
    setGameSettings(defaultGameSettings);
    setCategories({
      defaultCategories: generateCategories(true),
      customCategories: [],
    });
  }

  const gameSettingsParams = {
    gameSettings,
    setGameSettings,
    categories,
    setCategories,
    resetGameSettings,
  }

  return (
    <Grid container component="main" sx={{ height: '100vh' }} >
      <Grid item xs={12} sm={12} md={8}
        sx={{ maxHeight: '100vh', overflow: 'auto' }}>
        <GameSettings {...gameSettingsParams}></GameSettings>
      </Grid>
      <Grid item xs={12} sm={12} md={4} component={Paper}
        sx={{ maxHeight: '100vh', overflow: 'auto' }}>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Typography variant="button" sx={{ fontSize: 40 }}>
            {room}
          </Typography>
          {users.map((
            (user, index) =>
            (<Typography variant="h5" key={index}>{user.userName}
              {user.isHost ? <span> (Host)</span> : ''}
            </Typography>)))}
        </Box>
      </Grid>
    </Grid>
  );
}

export default Lobby;