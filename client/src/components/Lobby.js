import Box from '@material-ui/core/Box';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';

const Lobby = () => {
  return (
    <Container component="game">
      <Box
        sx={{
          flexDirection: 'column',
          textAlign: "center",
        }}
      >
        <Typography component="h1" variant="h4">
          GAME LOBBY
        </Typography>
      </Box>
    </Container>
  );
}

export default Lobby;