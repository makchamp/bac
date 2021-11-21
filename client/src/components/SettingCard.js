import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import React from 'react';

const SettingCard = ({
  title,
  subheader,
  titleSize,
  color,
  icon,
}) => {
  const PropIcon = icon;
  return (
    <Card variant='outlined'
      sx={{
        width: 320,
        background: 'none',
        border: 'none'
      }}>
      <CardHeader
        avatar={
          <Avatar
            sx={{
              bgcolor: color,
              width: 92,
              height: 92
            }}
          >
          <PropIcon sx={{fontSize:60, color:"white"}}></PropIcon>
          </Avatar>
        }
        title={title}
        subheader={subheader}
        titleTypographyProps={{
          fontWeight: 'bold',
          fontSize: titleSize || 28
        }}
        subheaderTypographyProps={{
          fontSize: 16 
        }}
      />
    </Card>
  );
}

export default SettingCard;