import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Paper,
  Divider,
  Chip,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

// サンプルデータ
const popularArtists = [
  {
    id: 1,
    name: 'アーティスト1',
    image: 'https://via.placeholder.com/50',
    genre: 'J-POP',
    views: 15000,
    rank: 1,
  },
  {
    id: 2,
    name: 'アーティスト2',
    image: 'https://via.placeholder.com/50',
    genre: 'ロック',
    views: 12000,
    rank: 2,
  },
  {
    id: 3,
    name: 'アーティスト3',
    image: 'https://via.placeholder.com/50',
    genre: 'アイドル',
    views: 10000,
    rank: 3,
  },
  {
    id: 4,
    name: 'アーティスト4',
    image: 'https://via.placeholder.com/50',
    genre: 'ヒップホップ',
    views: 8000,
    rank: 4,
  },
  {
    id: 5,
    name: 'アーティスト5',
    image: 'https://via.placeholder.com/50',
    genre: 'クラシック',
    views: 5000,
    rank: 5,
  },
];

function PopularArtists() {
  const navigate = useNavigate();

  const handleArtistClick = (artistId) => {
    navigate(`/artists/${artistId}`);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <TrendingUpIcon sx={{ mr: 1, color: 'red' }} />
        <Typography variant="h6">人気アーティストランキング</Typography>
      </Box>
      <Divider sx={{ mb: 2 }} />
      <List>
        {popularArtists.map((artist) => (
          <ListItem
            key={artist.id}
            button
            onClick={() => handleArtistClick(artist.id)}
            sx={{
              backgroundColor: artist.rank <= 3 ? 'rgba(255, 215, 0, 0.1)' : 'transparent',
            }}
          >
            <ListItemAvatar>
              <Avatar
                src={artist.image}
                alt={artist.name}
                sx={{
                  border: artist.rank <= 3 ? '2px solid gold' : 'none',
                }}
              />
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography
                    variant="h6"
                    component="span"
                    sx={{
                      color: artist.rank <= 3 ? 'primary.main' : 'text.primary',
                      fontWeight: artist.rank <= 3 ? 'bold' : 'normal',
                    }}
                  >
                    {artist.rank}. {artist.name}
                  </Typography>
                  <Chip
                    label={`${artist.views.toLocaleString()} views`}
                    size="small"
                    sx={{ ml: 1 }}
                  />
                </Box>
              }
              secondary={
                <Chip
                  label={artist.genre}
                  size="small"
                  variant="outlined"
                />
              }
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}

export default PopularArtists; 