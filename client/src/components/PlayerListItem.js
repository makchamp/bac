import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import AddModeratorIcon from '@mui/icons-material/AddModerator';
import PersonIcon from '@mui/icons-material/Person';
import Tooltip from '@mui/material/Tooltip';

const PlayerListItem = ({ user }) => {
  return (
    <ListItem
      key={user.userID}
      secondaryAction={
        user.isHost && (
          <>
            <Tooltip title='Room Admin'>
              <AddModeratorIcon />
            </Tooltip>
          </>
        )
      }>
      <ListItemIcon>
        {' '}
        <PersonIcon />{' '}
      </ListItemIcon>
      <ListItemText id={user.userID}>
        <Typography variant='h5' key={user.userID}>
          {user.userName}
        </Typography>
      </ListItemText>
    </ListItem>
  );
};

export default PlayerListItem;
