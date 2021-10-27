import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const Round = ({timer}) => {
  return (
      <Grid item xs={12} sm={12} md={8}
        sx={{ maxHeight: '100vh', overflow: 'auto' }}>
        <Typography sx={{ fontSize: '50px'}}>{timer}</Typography>
      </Grid>
  );
}

export default Round;