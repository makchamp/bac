import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
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