import * as React from 'react';
import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Categories from './Categories';

const GameSettings = () => {
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
      <Accordion defaultExpanded={true} >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1a-content"
          id="panel1a-header"
        >
          <Typography sx={{ width: '50%', flexShrink: 0 }}>Categories</Typography>
          <Typography sx={{ color: 'text.secondary' }}>Select or Add Categories</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Categories></Categories>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}

export default GameSettings;