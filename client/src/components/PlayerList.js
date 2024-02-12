import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import { useUserStore } from '../services/state';
import PlayerListItem from './PlayerListItem';

const PlayerList = ({ users, roomName }) => {
  const user = useUserStore((state) => state.user);

  return (
    <Grid
      item
      xs={12}
      sm={12}
      md={4}
      component={Paper}
      sx={{ maxHeight: '100vh', overflow: 'auto' }}>
      <Box
        sx={{
          my: 8,
          mx: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
        <Typography variant='button' sx={{ fontSize: 40 }}>
          {roomName}
        </Typography>
        <List
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
          }}
          subheader={<ListSubheader>Players</ListSubheader>}>
          {user.socketID && (
            <PlayerListItem key={user.userID} user={user}></PlayerListItem>
          )}
          {users.map((u, index) => {
            return (
              u.inRoom &&
              u.userID !== user.userID && (
                <PlayerListItem key={index} user={u}></PlayerListItem>
              )
            );
          })}
        </List>
      </Box>
    </Grid>
  );
};

export default PlayerList;
