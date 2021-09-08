import React, { PureComponent, memo } from 'react';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Slider from '@mui/material/Slider';
import MuiInput from '@mui/material/Input';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import memoize from 'memoize-one';
import { FixedSizeList as List, areEqual } from 'react-window';
import { categories } from '../data/categories';

const generateItems = (isActive) => {
  return categories.map((category) =>
  ({
    label: category,
    isActive: isActive
  })
  );
}

const Input = styled(MuiInput)`
  width: 42px;
`;

const Row = memo(({ data, index, style }) => {
  const { items, toggleItemActive } = data;
  const item = items[index];

  return (
    <ListItem style={style} key={index} component="div" disablePadding >
      <ListItemButton role={undefined} onClick={() => toggleItemActive(index)} dense>
        <ListItemIcon>
          <Checkbox
            checked={item.isActive}
            tabIndex={-1}
            disableRipple
          />
        </ListItemIcon>
        <ListItemText primary={item.label} />
      </ListItemButton>
    </ListItem>
  );
}, areEqual);

const createItemData = memoize((items, toggleItemActive) => ({
  items,
  toggleItemActive,
}));

function CategoryList({ items, toggleItemActive }) {
  const itemData = createItemData(items, toggleItemActive);
  return (
    <List
      height={200}
      itemCount={items.length}
      itemData={itemData}
      itemSize={35}
    >
      {Row}
    </List>
  );
}

const maxCategoriesToPlay = 18;
const minCategoriesToPlay = 6;
const defaultCategoriesToPlay = 12;
class Categories extends PureComponent {
  state = {
    items: generateItems(true),
    checked: true,
    numCategoriesToPlay: defaultCategoriesToPlay
  };

  setNumCategoriesToPlay = (value) => {
    this.setState({
      numCategoriesToPlay: value,
    });
  }

  toggleAllItems = () => {
    this.setState({
      items: generateItems(!this.state.checked),
      checked: !this.state.checked,

    });
  }

  toggleItemActive = (index) => {
    this.setState(prevState => {
      const item = prevState.items[index];
      const items = prevState.items.concat();
      items[index] = {
        ...item,
        isActive: !item.isActive,
      };
      return { items };
    });
  }

  handleSliderChange = (event, newValue) => {
    this.setNumCategoriesToPlay(newValue);
  };

  handleInputChange = (event) => {
    this.setNumCategoriesToPlay(event.target.value === '' ? '' : Number(event.target.value));
  };

  handleBlur = () => {
    if (!this.state.numCategoriesToPlay) {
      this.setNumCategoriesToPlay(defaultCategoriesToPlay);
    } else if (this.state.numCategoriesToPlay < minCategoriesToPlay) {
      this.setNumCategoriesToPlay(minCategoriesToPlay);
    } else if (this.state.numCategoriesToPlay > maxCategoriesToPlay) {
      this.setNumCategoriesToPlay(maxCategoriesToPlay);
    }
  };

  render() {
    return (
      <Box>
        <FormControlLabel
          control={
            <Checkbox defaultChecked onClick={this.toggleAllItems} />
          }
          label="Toggle All"
        />
        <CategoryList
          items={this.state.items}
          toggleItemActive={this.toggleItemActive}
        />

        <Box sx={{ mt: 4 }}>
          <Typography >Custom Categories</Typography>
          <Typography sx={{ color: 'text.secondary' }}>Add Your Own Categories to the List!</Typography>
          <Autocomplete
            multiple
            options={[]}
            defaultValue={[]}
            freeSolo
            renderTags={(value, getTagProps) => {
              return value.map((option, index) => (
                <Chip variant="outlined" label={option} {...getTagProps({ index })} />
              ))
            }
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Custom Categories"
                placeholder="Categories"
              />
            )}
            sx={{ p: 1 }}
          />
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography >Number of Categories To Play</Typography>
          <Typography sx={{ color: 'text.secondary' }}>
            Min: {minCategoriesToPlay}, Max: {maxCategoriesToPlay}</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
            </Grid>
            <Grid item>
              <Input
                value={typeof this.state.numCategoriesToPlay === 'number'
                  ? this.state.numCategoriesToPlay : defaultCategoriesToPlay}
                onChange={this.handleInputChange}
                onBlur={this.handleBlur}
                inputProps={{
                  step: 1,
                  min: minCategoriesToPlay,
                  max: maxCategoriesToPlay,
                  type: 'number',
                  'aria-labelledby': 'input-slider',
                }}
              />
            </Grid>
            <Grid item xs>
              <Slider
                aria-label="Small steps"
                value={typeof this.state.numCategoriesToPlay === 'number'
                  ? this.state.numCategoriesToPlay : defaultCategoriesToPlay}
                onChange={this.handleSliderChange}
                defaultValue={defaultCategoriesToPlay}
                step={1}
                marks
                min={minCategoriesToPlay}
                max={maxCategoriesToPlay}
                valueLabelDisplay="auto"
              />
            </Grid>
          </Grid>
        </Box>
      </Box>

    );
  }
}

export default Categories;