import ToggleButton from '@mui/material/ToggleButton';
import Paper from '@mui/material/Paper';
import Switch from '@mui/material/Switch';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export const generateLetters = () => {
  const leastCommon5 = ['x', 'z', 'y', 'q', 'k'];
  const alphabet = {};
  for (let i = 97; i <= 122; i++) {
    const letter = String.fromCharCode(i);
    alphabet[letter] = {
      isActive: !leastCommon5.includes(letter),
    };
  }
  return alphabet;
};

const Letters = ({
  letters,
  setLetters,
  letterRotation,
  setLetterRotation,
}) => {
  const onLetterToggle = (letter) => {
    letters[letter].isActive = !letters[letter].isActive;
    setLetters({ ...letters });
  };

  const onLetterRotationToggle = (event) => {
    setLetterRotation(event.target.checked);
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignContent: 'center',
          p: 1,
        }}>
        {Object.keys(letters).map((letter) => {
          return (
            <ToggleButton
              key={letter}
              value={letter}
              selected={letters[letter].isActive}
              onChange={() => onLetterToggle(letter)}
              size='large'
              sx={{ m: 0.5, fontSize: 20 }}>
              {letter}
            </ToggleButton>
          );
        })}
      </Paper>
      <Box sx={{ mt: 4 }}>
        <Typography>Letter Rotation</Typography>
        <Typography sx={{ color: 'text.secondary' }}>
          Determine whether each category requires a different letter
        </Typography>

        <Stack direction='row' spacing={5} alignItems='center'>
          <Typography>Single Letter Per Round</Typography>
          <Switch checked={letterRotation} onChange={onLetterRotationToggle} />
          <Typography>Multiple Letters Per Round</Typography>
        </Stack>
      </Box>
    </Box>
  );
};

export default Letters;
