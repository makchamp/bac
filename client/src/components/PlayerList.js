import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import { useUserStore } from '../services/state';
import PlayerListItem from './PlayerListItem';
import Tooltip from '@mui/material/Tooltip';

const PlayerList = ({ users, roomName }) => {
  const { currentUser } = useUserStore();

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
          {currentUser.socketID && (
            <Tooltip title='You' placement="left">
              <Paper variant='outlined' elevation={0}>
                <PlayerListItem
                  key={currentUser.userID}
                  user={currentUser}></PlayerListItem>
              </Paper>
            </Tooltip>
          )}
          {users.map((u, index) => {
            return (
              u.inRoom &&
              u.userID !== currentUser.userID && (
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
