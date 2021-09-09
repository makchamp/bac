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
import Typography from '@mui/material/Typography';
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

class Categories extends PureComponent {
  state = {
    items: generateItems(true),
    checked: true,
  };

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
      </Box>
    );
  }
}

export default Categories;