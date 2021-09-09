import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Categories from './Categories';
import { useState } from 'react';
import Letters from './Letters';
import SliderInput from './SliderInput';

const panels = {
  general: "generalPanel",
  categories: "categoriesPanel",
  letters: "lettersPanel"
}
const GameSettings = () => {
  const [panelExpanded, setPanelExpanded] = useState(false);
  const handlePanelExpansion = (panel) => (event, isExpanded) => {
    setPanelExpanded(isExpanded ? panel : false);
  }

  const [numOfRounds, setNumOfRounds] = useState(3);
  const [numOfCategories, setNumOfCategories] = useState(12);
  const [lengthOfRound, setLengthOfRound] = useState(120);

  const roundParams = {
    title: 'Number of Rounds',
    value: numOfRounds,
    minValue: 1,
    maxValue: 10,
    defaultValue: 3,
    stepValue: 1,
    setValue: setNumOfRounds
  };

  const timeParams = {
    title: 'Round Duration (s)',
    value: lengthOfRound,
    minValue: 30,
    maxValue: 300,
    defaultValue: 120,
    stepValue: 10,
    setValue: setLengthOfRound
  };

  const categoryParams = {
    title: 'Number of Categories To Play',
    value: numOfCategories,
    minValue: 6,
    maxValue: 18,
    defaultValue: 12,
    stepValue: 1,
    setValue: setNumOfCategories
  };


  return (
    <Box
      sx={{
        my: 8,
        mx: 4,
      }}
    >
      <Typography variant="h3" sx={{ m: 1 }}>
        Game Settings
      </Typography>

      <Accordion
        expanded={panelExpanded === panels.general}
        onChange={handlePanelExpansion(panels.general)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography sx={{ width: '45%', flexShrink: 0 }}>General</Typography>
          <Typography sx={{ color: 'text.secondary' }}>Configure Rounds and Scoring</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <SliderInput {...roundParams}></SliderInput>
          <SliderInput {...timeParams}></SliderInput>
        </AccordionDetails>
      </Accordion>


      <Accordion
        expanded={panelExpanded === panels.categories}
        onChange={handlePanelExpansion(panels.categories)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography sx={{ width: '45%', flexShrink: 0 }}>Categories</Typography>
          <Typography sx={{ color: 'text.secondary', }}>Select or Add Categories</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Categories></Categories>
          <SliderInput
            {...categoryParams}
          ></SliderInput>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={panelExpanded === panels.letters}
        onChange={handlePanelExpansion(panels.letters)}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
        >
          <Typography sx={{ width: '45%', flexShrink: 0 }}>Letters</Typography>
          <Typography sx={{ color: 'text.secondary' }}>Configures Letters To Play</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Letters></Letters>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default GameSettings;