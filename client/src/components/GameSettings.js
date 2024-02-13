import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Grid from '@mui/material/Grid';
import Categories from './Categories';
import Letters from './Letters';
import SliderInput from './SliderInput';
import SettingCard from './SettingCard';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { green, teal, purple, indigo } from '@mui/material/colors';
import TimerIcon from '@mui/icons-material/Timer';
import CategoryIcon from '@mui/icons-material/Category';
import SpellcheckIcon from '@mui/icons-material/Spellcheck';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import { useUserStore } from '../services/state';
import { useState } from 'react';

const panels = {
  general: 'generalPanel',
  categories: 'categoriesPanel',
  letters: 'lettersPanel',
};
const GameSettings = ({
  gameSettings,
  setGameSettings,
  categories,
  setCategories,
  resetGameSettings
}) => {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [panelExpanded, setPanelExpanded] = useState(false);
  const { currentUser } = useUserStore();

  const handlePanelExpansion = (panel) => (event, isExpanded) => {
    setPanelExpanded(isExpanded ? panel : false);
  };

  // General Settings
  const setNumOfRounds = (numOfRounds) => {
    setGameSettings({ ...gameSettings, numOfRounds });
  };
  const setLengthOfRound = (lengthOfRound) => {
    setGameSettings({ ...gameSettings, lengthOfRound });
  };

  // Category Settings
  const setNumOfCategories = (numOfCategories) => {
    setGameSettings({ ...gameSettings, numOfCategories });
  };

  const setDefaultCategories = (defaultCategories) => {
    setCategories({ ...categories, defaultCategories });
  };
  const setCustomCategories = (customCategories) => {
    setCategories({ ...categories, customCategories });
  };

  const onAllCategoriesToggle = (checked) => {
    setGameSettings({ ...gameSettings, toggleAllCategories: checked });
  };

  // Letter Settings
  const setLetters = (letters) => {
    setGameSettings({ ...gameSettings, letters });
  };

  const setLetterRotation = (checked) => {
    setGameSettings({ ...gameSettings, letterRotation: checked });
  };

  const roundParams = {
    title: 'Number of Rounds',
    value: gameSettings.numOfRounds,
    minValue: 1,
    maxValue: 10,
    defaultValue: 3,
    stepValue: 1,
    setValue: setNumOfRounds,
  };

  const timeParams = {
    title: 'Round Duration (s)',
    value: gameSettings.lengthOfRound,
    minValue: 30,
    maxValue: 300,
    defaultValue: 120,
    stepValue: 10,
    setValue: setLengthOfRound,
  };

  const numCategoryParams = {
    title: 'Number of Categories To Play',
    value: gameSettings.numOfCategories,
    minValue: 6,
    maxValue: 18,
    defaultValue: 12,
    stepValue: 1,
    setValue: setNumOfCategories,
  };

  const letterParams = {
    letters: gameSettings.letters,
    setLetters,
    letterRotation: gameSettings.letterRotation,
    setLetterRotation,
  };

  const categoryParams = {
    categories: categories.defaultCategories,
    setCategories: setDefaultCategories,
    customCategories: categories.customCategories,
    setCustomCategories,
    toggleAll: gameSettings.toggleAllCategories,
    onAllCategoriesToggle,
  };

  const handleClickOpen = () => {
    setResetDialogOpen(true);
  };

  const handleClose = () => {
    setResetDialogOpen(false);
  };

  return (
    <Box
      sx={{
        my: 8,
        mx: 4,
      }}>
      <Typography variant='h3'>Game Settings</Typography>
      {currentUser?.isHost ? (
        <Box>
          <Box>
            <Button
              variant='outlined'
              onClick={handleClickOpen}
              sx={{ mb: 1, width: '200px' }}>
              Default Settings
            </Button>
            <Dialog
              open={resetDialogOpen}
              onClose={handleClose}
              aria-labelledby='alert-dialog-title'
              aria-describedby='alert-dialog-description'>
              <DialogTitle id='alert-dialog-title'>
                Reset Game Settings ?
              </DialogTitle>
              <DialogContent>
                <DialogContentText id='alert-dialog-description'>
                  Revert game settings back to their default values ?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} autoFocus>
                  Cancel
                </Button>
                <Button
                  color='error'
                  onClick={() => {
                    resetGameSettings();
                    handleClose();
                  }}
                  autoFocus>
                  Reset
                </Button>
              </DialogActions>
            </Dialog>
          </Box>

          <Accordion
            expanded={panelExpanded === panels.general}
            onChange={handlePanelExpansion(panels.general)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ width: '45%', flexShrink: 0 }}>
                Rounds
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Configure Number and Duration
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <SliderInput {...roundParams}></SliderInput>
              <SliderInput {...timeParams}></SliderInput>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={panelExpanded === panels.categories}
            onChange={handlePanelExpansion(panels.categories)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ width: '45%', flexShrink: 0 }}>
                Categories
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Select or Add Categories
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Categories {...categoryParams}></Categories>
              <SliderInput {...numCategoryParams}></SliderInput>
            </AccordionDetails>
          </Accordion>

          <Accordion
            expanded={panelExpanded === panels.letters}
            onChange={handlePanelExpansion(panels.letters)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography sx={{ width: '45%', flexShrink: 0 }}>
                Letters
              </Typography>
              <Typography sx={{ color: 'text.secondary' }}>
                Select Letters
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Letters {...letterParams}></Letters>
            </AccordionDetails>
          </Accordion>
        </Box>
      ) : (
        <Box>
          <Typography sx={{ fontSize: '20px', color: 'text.secondary' }}>
            Waiting for host to start game...
          </Typography>
        </Box>
      )}

      <Grid
        container
        direction='row'
        justifyContent='space-evenly'
        alignItems='center'
        sx={{ marginTop: 3 }}>
        <SettingCard
          title={gameSettings.numOfRounds}
          subheader='Number of Rounds'
          color={teal[700]}
          icon={MoreTimeIcon}
        />
        <SettingCard
          title={`${gameSettings.lengthOfRound}s`}
          subheader='Round Duration'
          color={green[700]}
          icon={TimerIcon}
        />
        <SettingCard
          title={gameSettings.numOfCategories}
          subheader='Categories Per Round'
          color={purple[700]}
          icon={CategoryIcon}
        />
        <SettingCard
          title={
            gameSettings.letterRotation
              ? 'Mulitple Letter Round'
              : 'Single Letter Round'
          }
          subheader='Letter Rotation'
          titleSize={16}
          color={indigo[700]}
          icon={SpellcheckIcon}
        />
      </Grid>
    </Box>
  );
};

export default GameSettings;
