import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';

const Round = ({
  timer,
  gameState
}) => {

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar sx={{
          margin: '10px',
          height: '100px'
        }}>
          <Typography variant="h4" component="div" sx={{ flexGrow: 1 }}>
            {gameState.letterRotation ?
              <Typography sx={{ fontSize: '40px' }}>
                Multiple Letter
              </Typography> :
              <Typography sx={{ fontSize: '40px' }}>
                Single Letter
              </Typography>}
          </Typography>
          <Typography sx={{ fontSize: '50px' }}>{timer}</Typography>
        </Toolbar>
      </AppBar>
    </Box>
  );
}

export default Round;