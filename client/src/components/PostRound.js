import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

const PostRound = () => {

  return (
      <Grid item xs={12} sm={12} md={8}
        sx={{ maxHeight: '100vh', overflow: 'auto' }}>
        <Typography >Post Round</Typography>
      </Grid>
  );
}

export default PostRound;