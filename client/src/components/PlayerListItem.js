import Typography from '@mui/material/Typography';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import PersonIcon from '@mui/icons-material/Person';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

const PlayerListItem = ({ user }) => {
  return (
    <ListItem
      key={user.userID}
      secondaryAction={
        user.isHost && (
          <>
            <Tooltip title='Host'>
            <IconButton>
              <AdminPanelSettingsIcon />
              </IconButton>
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
