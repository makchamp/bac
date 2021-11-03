import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Input from '@mui/material/Input';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { styled } from '@mui/material/styles';
import logo from '../logo.svg';
import { useState, useEffect } from 'react'
import { Route, useHistory } from "react-router-dom";
import Room from './Room';
import { putObject, fetchObject, keys } from '../services/cache';
import axios from 'axios';

const RoomInputField = styled(Input)(() => ({
  height: 80,
  margin: 35,
  padding: 25,
  fontSize: 24,
  border: "2px solid #61dbfb",
  color: "#FFFF",
}));

const ConnectRoom = () => {
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');
  const history = useHistory();

  function HandleSubmit(e) {
    e.preventDefault();

    putObject(keys.user, { userName, roomName });
    history.push(`/room/${roomName}`);
  }

  useEffect(() => {
    const loadCache = () => {
      const user = fetchObject(keys.user);
      if (user) {
        setUserName(user.userName);
        setRoomName(user.roomName);
      }
    };
    // Used in development to set cross server session cookie
    if (process.env.NODE_ENV === 'development') {
      axios.get('/ping')
        .catch(err => console.log(err));
    }
    loadCache();
  }, []);

  return (
    <>
      <Route
        path={`/room/${roomName}`}
        render={(props) =>
        (<Room userName={userName} roomName={roomName}></Room>)}
      />
      <Container component="main">
        <CssBaseline />
        <Route exact path='/' render={(props) => (
          <Box
            sx={{
              marginTop: 8,
              border: '5px solid #61dbfb',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: "center",
            }}
          >
            <Box component="img" alt="logo" src={logo} className="App-logo">
            </Box>
            <Typography component="h1" variant="h4">
              Enter Or Create a Room
            </Typography>
            <Box component="form" onSubmit={HandleSubmit}>
              <RoomInputField
                name="userName"
                id="userNameID"
                placeholder="Name"
                required
                value={userName}
                onChange={(e) => {
                  setUserName(e.target.value);
                }}
              />
              <RoomInputField
                name="roomName"
                id="roomID"
                placeholder="Room"
                required
                value={roomName}
                onChange={(e) => {
                  setRoomName(e.target.value);
                }}
              />
              <Box>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  sx={{
                    m: 8,
                    width: "150px",
                    fontSize: "24px",
                  }}
                >
                  Go!
                </Button>
              </Box>
            </Box>
          </Box>
        )} />
      </Container>
    </>
  );
}

export default ConnectRoom;