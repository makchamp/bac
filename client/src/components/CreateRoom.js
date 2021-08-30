import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import Input from '@material-ui/core/Input';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import Container from '@material-ui/core/Container';
import { styled } from '@material-ui/core/styles';
import logo from '../logo.svg';

function CreateRoom() {
  const RoomInputField = styled(Input)(() => ({
    height: 80,
    margin: 35,
    padding: 25,
    fontSize: 24,
    border: "2px solid #61dbfb",
    color: "#FFFF",
  }));

  return (
    <Container component="main">
      <CssBaseline />
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
        <Box component="form">
          <RoomInputField
            name="userName"
            id="userNameID"
            placeholder="Name"
          />
          <RoomInputField
            name="roomName"
            id="roomID"
            placeholder="Room"
            autoFocus
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
    </Container>
  );
}

export default CreateRoom;