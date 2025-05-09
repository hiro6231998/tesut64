import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  IconButton,
  Button,
  Divider,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import DeleteIcon from '@mui/icons-material/Delete';

// サンプルデータ
const favoriteArtists = [
  {
    id: 1,
    name: 'アーティスト1',
    image: 'https://via.placeholder.com/150',
    description: '人気のポップスター',
    genre: 'J-POP',
    nextEvent: '2024-05-15 東京ドーム',
  },
  {
    id: 2,
    name: 'アーティスト2',
    image: 'https://via.placeholder.com/150',
    description: '新進気鋭のロックバンド',
    genre: 'ロック',
    nextEvent: '2024-05-20 大阪城ホール',
  },
  {
    id: 3,
    name: 'アーティスト3',
    image: 'https://via.placeholder.com/150',
    description: '人気のアイドルグループ',
    genre: 'アイドル',
    nextEvent: '2024-05-25 福岡ドーム',
  },
];

function FavoriteArtists() {
  const navigate = useNavigate();
  const [artists, setArtists] = useState(favoriteArtists);

  const handleArtistClick = (artistId) => {
    navigate(`/artists/${artistId}`);
  };

  const handleRemoveFavorite = (artistId, event) => {
    event.stopPropagation();
    setArtists(artists.filter(artist => artist.id !== artistId));
  };

  const handleViewAllArtists = () => {
    navigate('/artists');
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h1">
              お気に入りアーティスト
            </Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleViewAllArtists}
            >
              すべてのアーティストを見る
            </Button>
          </Box>

          <Divider sx={{ mb: 3 }} />

          {artists.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="text.secondary">
                お気に入りのアーティストがありません
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleViewAllArtists}
                sx={{ mt: 2 }}
              >
                アーティストを探す
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {artists.map((artist) => (
                <Grid item xs={12} sm={6} md={4} key={artist.id}>
                  <Card>
                    <CardActionArea onClick={() => handleArtistClick(artist.id)}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={artist.image}
                        alt={artist.name}
                      />
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Typography variant="h6" component="div">
                            {artist.name}
                          </Typography>
                          <IconButton
                            color="primary"
                            onClick={(e) => handleRemoveFavorite(artist.id, e)}
                            sx={{ ml: 1 }}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {artist.description}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          ジャンル: {artist.genre}
                        </Typography>
                        <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                          次の公演: {artist.nextEvent}
                        </Typography>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      </Box>
    </Container>
  );
}

export default FavoriteArtists; 