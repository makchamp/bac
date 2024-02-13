import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import InputBase from '@mui/material/InputBase';
import { useUserStore } from '../services/state';

const Round = ({ timer, gameState, saveAnswer }) => {
  const { currentUser } = useUserStore();

  const getAnswerValue = (index) => {
    try {
      const { answ } =
        gameState.answers[currentUser.userID].answers[gameState.currentRound][
          index
        ];
      return answ || '';
    } catch (error) {
      return '';
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='sticky'>
        <Toolbar
          sx={{
            margin: '10px',
            height: '100px',
          }}>
          <Typography
            variant='h4'
            component='div'
            sx={{
              fontSize: '40px',
              flexGrow: 1,
            }}>
            {gameState.letterRotation
              ? 'Multiple Letter Round'
              : 'Single Letter Round'}
          </Typography>
          <Typography sx={{ fontSize: '50px' }}>{timer}</Typography>
        </Toolbar>
      </AppBar>

      <TableContainer>
        <Table>
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '70%' }} />
          </colgroup>
          <TableBody>
            {gameState.categories[gameState.currentRound].map((row, index) => (
              <TableRow key={index}>
                <TableCell
                  align='center'
                  sx={{
                    fontSize: '30px',
                  }}>
                  <b>{row.letter.toUpperCase()}</b>
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: '25px',
                  }}>
                  {row.category}
                </TableCell>
                <TableCell sx={{ borderLeft: '0.1px solid grey' }}>
                  <InputBase
                    sx={{ fontSize: '25px', marginLeft: '10px' }}
                    id={gameState.categories[gameState.currentRound].category}
                    placeholder={row.letter.toUpperCase()}
                    fullWidth
                    inputProps={{
                      maxLength: 75,
                    }}
                    defaultValue={getAnswerValue(index)}
                    onChange={(e) => {
                      saveAnswer(index, e.target.value);
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Round;
