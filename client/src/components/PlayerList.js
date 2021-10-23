import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';

const PlayerList = ({ users, roomName }) => {
  
  return (
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
            {roomName}
          </Typography>
          {users.map((
            (user, index) =>
            (user.inRoom ? <Typography variant="h5" key={index}>{user.userName}
              {user.isHost ? <span> (Host)</span> : ''}
            </Typography> : '')))}
        </Box>
      </Grid>
  );
}

export default PlayerList;