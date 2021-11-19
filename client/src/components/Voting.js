import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableRow from '@mui/material/TableRow';
import { useState, useEffect } from 'react'
import { putObject, removeObject, fetchObject, keys } from '../services/cache';

const Voting = ({
  gameState,
  vote,
  nextCategory
}) => {
  const currentCategory = gameState.currentCategory;
  const categories = gameState.categories[gameState.currentRound];
  const category = categories[currentCategory];

  const answerRatings = () => {
    return category.answers.map(({ answID, score, ...checked }) => checked)
  }
  const [votingButtons, setVotingButtons] = useState(answerRatings());

  const voteButtonLabels = {
    upvote: { label: 'upvote' },
    downvote: { label: 'downvote' },
  }

  useEffect(() => {
    const loadCache = () => {
      const ratings = fetchObject(keys.ratings);
      if (ratings) {
        setVotingButtons(ratings);
      }
    }
    loadCache();
  }, []);


  const handleVote = (rowID, answID, value) => {
    vote(answID, value);
    const buttonLabel = value.label;
    const upChecked = votingButtons[rowID].upChecked;
    const downChecked = votingButtons[rowID].downChecked;

    if (buttonLabel === voteButtonLabels.upvote.label) {
      votingButtons[rowID].upChecked = !upChecked;
      votingButtons[rowID].downChecked = false
    }
    else {
      votingButtons[rowID].downChecked = !downChecked;
      votingButtons[rowID].upChecked = false
    }
    setVotingButtons(votingButtons);
    putObject(keys.ratings, votingButtons);
  }

  const handleNextCategory = () => {
    removeObject(keys.ratings);
    nextCategory();
    setVotingButtons(answerRatings());
  }

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
            onClick={handleNextCategory}>
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
                  <b>{row.score ? row.score : 0}</b>
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: '25px',
                  }}>
                  {row.answ}
                </TableCell>
                <TableCell
                  sx={{
                    fontSize: '25px',
                  }}>
                  <Box
                    sx={{
                      display: 'flex',
                      '& > *': {
                        m: 1,
                      },
                    }}
                  >
                    <IconButton aria-label={voteButtonLabels.upvote.label}
                      onClick={() => handleVote(index, row.answID, voteButtonLabels.upvote)}
                    >
                      {votingButtons[index].upChecked ? <ThumbUpAltIcon /> : <ThumbUpOffAltIcon />}
                    </IconButton>
                    <IconButton aria-label={voteButtonLabels.downvote.label}
                      onClick={() => handleVote(index, row.answID, voteButtonLabels.downvote)}
                    >
                      {votingButtons[index].downChecked ? <ThumbDownAltIcon /> : <ThumbDownOffAltIcon />}
                    </IconButton>
                  </Box>
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
