import ToggleButton from '@mui/material/ToggleButton';
import Paper from '@mui/material/Paper';
import { useState } from 'react'

const generateLetters = () => {
  const lestCommon5 = ['x', 'z', 'y', 'q', 'k'];
  const alphabet = {};
  for (let i = 97; i <= 122; i++) {
    const letter = String.fromCharCode(i);
    alphabet[letter] = { 
      isActive: !lestCommon5.includes(letter), 
    };
  }
  return alphabet;
}

const Letters = () => {
  const [letters, setLetters] = useState(generateLetters);

  const onLetterToggle = (letter) => {
    letters[letter].isActive = !letters[letter].isActive;
    setLetters({...letters});
  }

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignContent: 'center',
        p: 1,
      }}
    >
      {Object.keys(letters).map((letter) => {
        return (
          <ToggleButton
            key={letter}
            value={letter}
            selected={letters[letter].isActive}
            onChange={() => onLetterToggle(letter)}
            size="large"
            sx={{ m: 0.5, fontSize: 20 }}
          >
            {letter}
          </ToggleButton>)
      })}
    </Paper>
  );
}

export default Letters;
