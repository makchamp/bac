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
import { useState, useEffect, useCallback } from 'react';
import { putObject, fetchObject, keys } from '../services/cache';
import { nextCategoryEvent } from '../services/gameService';
const Voting = ({ gameState, vote, nextCategory }) => {
  const currentCategory = gameState.currentCategory;
  const categories = gameState.categories[gameState.currentRound];
  const category = categories[currentCategory];
  const [loaded, setLoaded] = useState(false);

  const answerRatings = useCallback(() => {
    return category.answers.map(({ answ, score, ...checked }) => checked);
  }, [category.answers]);
  const [votingButtons, setVotingButtons] = useState(answerRatings());

  const voteButtonLabels = {
    upvote: { label: 'upvote' },
    downvote: { label: 'downvote' },
  };

  useEffect(() => {
    if (gameState.event === nextCategoryEvent) {
      setVotingButtons(answerRatings());
    }

    const assertStateMatch = (state) => {
      return (
        state[0] &&
        category.answers[0] &&
        state[0].answID === category.answers[0].answID
      );
    };
    const loadCache = () => {
      const ratings = fetchObject(keys.ratings);
      if (ratings && assertStateMatch(ratings)) {
        setVotingButtons(ratings);
      } else {
        setVotingButtons(answerRatings());
      }
      setLoaded(true);
    };
    if (!loaded) loadCache();
  }, [category.answers, gameState.event, answerRatings, loaded]);

  const handleVote = (rowID, answID, value) => {
    vote(answID, value);
    const buttonLabel = value.label;
    const upChecked = votingButtons[rowID].upChecked;
    const downChecked = votingButtons[rowID].downChecked;

    if (buttonLabel === voteButtonLabels.upvote.label) {
      votingButtons[rowID].upChecked = !upChecked;
      votingButtons[rowID].downChecked = false;
    } else {
      votingButtons[rowID].downChecked = !downChecked;
      votingButtons[rowID].upChecked = false;
    }
    setVotingButtons(votingButtons);
    putObject(keys.ratings, votingButtons);
  };

  const handleNextCategory = () => {
    nextCategory();
    setVotingButtons(answerRatings());
  };

  const roundCounter = () => {
    return `(${currentCategory + 1} / ${categories.length})`;
  };

  const noAnswers = () => {
    return category.answers.filter((answer) => answer.answ).length === 0;
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
              Round {gameState.currentRound + 1} - Voting {roundCounter()}
            </Typography>
          </Box>
          <Button
            variant='outlined'
            color='success'
            sx={{ fontSize: '30px' }}
            onClick={handleNextCategory}>
            {currentCategory + 1 === categories.length ? 'End Round' : 'Next'}
          </Button>
        </Toolbar>
      </AppBar>
      <Typography
        sx={{
          margin: 5,
          fontSize: '30px',
          textAlign: 'center',
        }}>
        <b>{category.letter.toUpperCase()}</b> - {category.category}
      </Typography>
      {noAnswers() ? (
        <Typography
          color='war'
          sx={{
            textAlign: 'center',
          }}>
          No submissions for this category
        </Typography>
      ) : (
        <TableContainer>
          <Table>
            <colgroup>
              <col style={{ width: '5%' }} />
              <col style={{ width: '25%' }} />
              <col style={{ width: '70%' }} />
            </colgroup>
            <TableBody>
              {category.answers.map(
                (row, index) =>
                  row.answ && (
                    <TableRow key={row.answID}>
                      <TableCell
                        align='center'
                        sx={{
                          fontSize: '30px',
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
                          }}>
                          <IconButton
                            aria-label={voteButtonLabels.upvote.label}
                            onClick={() =>
                              handleVote(
                                index,
                                row.answID,
                                voteButtonLabels.upvote
                              )
                            }>
                            {votingButtons[index].upChecked ? (
                              <ThumbUpAltIcon />
                            ) : (
                              <ThumbUpOffAltIcon />
                            )}
                          </IconButton>
                          <IconButton
                            aria-label={voteButtonLabels.downvote.label}
                            onClick={() =>
                              handleVote(
                                index,
                                row.answID,
                                voteButtonLabels.downvote
                              )
                            }>
                            {votingButtons[index].downChecked ? (
                              <ThumbDownAltIcon />
                            ) : (
                              <ThumbDownOffAltIcon />
                            )}
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  )
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default Voting;
