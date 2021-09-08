import * as React from 'react';
import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Categories from './Categories';
import { useState } from 'react';
import Letters from './Letters';

const GameSettings = () => {
  const panels = {
    categories: "categoriesPanel",
    letters: "lettersPanel"
  }
  const [panelExpanded, setPanelExpanded] = useState(false);

  const handlePanelExpansion = (panel) => (event, isExpanded) => {
    setPanelExpanded(isExpanded ? panel : false);
  }

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