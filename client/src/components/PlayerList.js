import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListSubheader from '@mui/material/ListSubheader';
import AddModeratorIcon from '@mui/icons-material/AddModerator';
import PersonIcon from '@mui/icons-material/Person';

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
        <List
          sx={{
            width: '100%',
            bgcolor: 'background.paper'
          }}
          subheader={<ListSubheader>Players</ListSubheader>}
        >
          {users.map((user, index) => {
            return (
              (user.inRoom ?
                <ListItem
                  key={index}
                  secondaryAction={
                    user.isHost ? <AddModeratorIcon /> : ''
                  }
                >
                  <ListItemIcon> <PersonIcon /> </ListItemIcon>
                  <ListItemText id={index} >
                    <Typography variant="h5" key={index}>{user.userName}
                    </Typography>
                  </ListItemText>
                </ListItem> : '')    
            );
          })}
        </List>
      </Box>
    </Grid >
  );
}

export default PlayerList;