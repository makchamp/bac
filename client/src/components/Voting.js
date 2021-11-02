import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';

const Voting = ({
  gameState,
  vote,
  nextCategory
}) => {
  const currentCategory = gameState.currentCategory;
  const categories = gameState.categories[gameState.currentRound];
  const category = categories[currentCategory];
  const roundCounter = () => {
    return `(${currentCategory + 1} / ${categories.length})`;
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="sticky">
        <Toolbar sx={{
          margin: '10px',
          height: '100px'
        }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography sx={{ fontSize: '40px' }}>
              Round {gameState.currentRound + 1} - Voting {roundCounter()}
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="success"
            sx={{ fontSize: '30px' }}
            onClick={nextCategory}>
            {currentCategory + 1 === categories.length ? 'End Round' : 'Next'}
          </Button>
        </Toolbar>
      </AppBar>
      <Typography sx={{
        margin: 5,
        fontSize: '30px',
        textAlign: 'center'
      }}>
        <b>{category.letter.toUpperCase()}</b> - {category.category}
      </Typography>
      <TableContainer>
        <Table>
          <colgroup>
            <col style={{ width: '5%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '70%' }} />
          </colgroup>
          <TableBody >
            {category.answers.map((row, index) => (
              <TableRow key={row.answID}>
                <TableCell
                  align='center'
                  sx={{
                    fontSize: '30px'
                  }}>
                  <b>{index}</b>
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: '25px',
                  }}>
                  {row.answ}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Voting;
