import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';

const Input = styled(MuiInput)`
  width: 42px;
`;
const SliderInput = ({
  title,
  value,
  minValue,
  maxValue,
  defaultValue,
  stepValue,
  setValue,
}) => {
  const handleSliderChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleInputChange = (event) => {
    setValue(event.target.value === '' ? '' : Number(event.target.value));
  };

  const handleBlur = () => {
    if (!value) {
      setValue(defaultValue);
    } else if (value < minValue) {
      setValue(minValue);
    } else if (value > maxValue) {
      setValue(maxValue);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      <Typography >{title}</Typography>
      <Typography sx={{ color: 'text.secondary' }}>
        Min: {minValue}, Max: {maxValue}</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
        </Grid>
        <Grid item>
          <Input
            value={typeof value === 'number' ? value : defaultValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            inputProps={{
              step: stepValue,
              min: minValue,
              max: maxValue,
              type: 'number',
              'aria-labelledby': 'input-slider',
            }}
          />
        </Grid>
        <Grid item xs>
          <Slider
            aria-label="Small steps"
            value={typeof value === 'number' ? value : defaultValue}
            onChange={handleSliderChange}
            defaultValue={defaultValue}
            step={stepValue}
            marks
            min={minValue}
            max={maxValue}
            valueLabelDisplay="auto"
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default SliderInput;