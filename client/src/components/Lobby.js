import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { useContext, useState, useEffect } from 'react'
import { SocketContext } from '../services/socket';
import { userSetChanged } from '../services/roomService';
import GameSettings from './GameSettings';

const Lobby = () => {
  const socket = useContext(SocketContext);
  const [users, setUsers] = useState([]);
  const [room, setRoom] = useState('');
  useEffect(() => {
    socket.on(userSetChanged, (payload) => {
      setUsers(payload.users);
      setRoom(payload.room)
    });
  }, [socket]);
  return (
    <Grid container component="main" sx={{ height: '100vh' }} >
      <Grid item xs={12} sm={12} md={8}
        sx={{ maxHeight: '100vh', overflow: 'auto' }}>
        <GameSettings></GameSettings>
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