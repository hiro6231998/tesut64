import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Paper,
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';

// サンプルデータ
const recommendedArtists = [
  {
    id: 1,
    name: 'アーティスト1',
    image: 'https://via.placeholder.com/150',
    description: '人気のポップスター',
    genre: 'J-POP',
    tags: ['ポップス', 'バラード'],
    matchScore: 95,
  },
  {
    id: 2,
    name: 'アーティスト2',
    image: 'https://via.placeholder.com/150',
    description: '新進気鋭のロックバンド',
    genre: 'ロック',
    tags: ['ハードロック', 'パンク'],
    matchScore: 85,
  },
  {
    id: 3,
    name: 'アーティスト3',
    image: 'https://via.placeholder.com/150',
    description: '人気のアイドルグループ',
    genre: 'アイドル',
    tags: ['アイドル', 'ダンス'],
    matchScore: 75,
  },
];

function RecommendedArtists() {
  const navigate = useNavigate();

  const handleArtistClick = (artistId) => {
    navigate(`/artists/${artistId}`);
  };

  return (
    <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <StarIcon sx={{ mr: 1, color: 'gold' }} />
        <Typography variant="h6">おすすめアーティスト</Typography>
      </Box>
      <Grid container spacing={2}>
        {recommendedArtists.map((artist) => (
          <Grid item xs={12} sm={6} md={4} key={artist.id}>
            <Card>
              <CardActionArea onClick={() => handleArtistClick(artist.id)}>
                <CardMedia
                  component="img"
                  height="140"
                  image={artist.image}
                  alt={artist.name}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="h6" component="div">
                      {artist.name}
                    </Typography>
                    <Chip
                      label={`${artist.matchScore}%`}
                      color="primary"
                      size="small"
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {artist.description}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Chip
                      label={artist.genre}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    {artist.tags.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1, mt: 1 }}
                      />
                    ))}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
}

export default RecommendedArtists; 