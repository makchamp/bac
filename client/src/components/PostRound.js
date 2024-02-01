import Typography from '@mui/material/Typography';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useEffect, useState } from 'react';

const PostRound = ({ gameState, users, nextRound }) => {
  const handleNextRound = () => {
    nextRound();
  };

  const [tableData, setTableData] = useState([[]]);

  const sortTableScores = (td) => {
    if (!td || td.length === 0) return td;
    const scoresColumnIdx = td[0].length - 1;
    const sortedTd = [...td.slice(1)].sort((a, b) => {
      const aVal = a[scoresColumnIdx];
      const bVal = b[scoresColumnIdx];

      if (aVal < bVal) {
        return 1;
      }
      if (aVal > bVal) {
        return -1;
      }
      return 0;
    });

    return [td[0], ...sortedTd];
  };

  useEffect(() => {
    const initTable = () => {
      const td = [['Players']];
      Object.keys(gameState.players).forEach((playerID, pidx) => {
        const columns = td[0];
        const row = [gameState.players[playerID].userName];
        gameState.answers[playerID].scores.rounds.forEach((rs, idx) => {
          if (gameState.currentRound >= idx) {
            if (pidx === 0) {
              columns.push(`Round ${idx + 1}`);
            }
            row.push(rs);
          }
        });
        if (pidx === 0) {
          columns.push('Total');
        }
        row.push(gameState.answers[playerID].scores.total);

        td.push(row);
      });
      setTableData(sortTableScores(td));
    };
    initTable();
  }, [gameState.answers, gameState.currentRound, gameState.players]);

  const isFinalRound = () => {
    return gameState.currentRound === gameState.numOfRounds - 1;
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position='sticky'>
        <Toolbar
          sx={{
            margin: '10px',
            height: '100px',
          }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography sx={{ fontSize: '40px' }}>
              {!isFinalRound()
                ? `Results - Round ${gameState.currentRound + 1} / ${
                    gameState.numOfRounds
                  }`
                : 'Final Results'}
            </Typography>
          </Box>
          <Button
            variant='outlined'
            color={isFinalRound() ? 'error' : 'warning'}
            sx={{ fontSize: '30px' }}
            onClick={handleNextRound}>
            {isFinalRound() ? 'End Game' : 'Next Round'}
          </Button>
        </Toolbar>
      </AppBar>

      <TableContainer>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              {tableData[0].map((column, index) => (
                <TableCell key={index}>
                  <b>{column}</b>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.slice(1).map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default PostRound;
