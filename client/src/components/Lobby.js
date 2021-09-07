import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { useContext, useState, useEffect } from 'react'
import { SocketContext } from '../services/socket';
import { userSetChanged } from '../services/roomService';

const Lobby = () => {
  const socket = useContext(SocketContext);
  const [users, setUsers] = useState([]);
  useEffect(() => {
    socket.on(userSetChanged, (payload) => {
      setUsers(payload.users);
    });
  }, [socket]);
  return (
    <Container>
      <Box
        sx={{
          flexDirection: 'column',
          textAlign: "center",
        }}
      >
        <Typography component="h1" variant="h4">
          GAME LOBBY
        </Typography>
        <>
          {users.map((
            (user, index) =>
              (<h3 key={index}>{user.userName}</h3>)))}
        </>
      </Box>
    </Container>
  );
}

export default Lobby;