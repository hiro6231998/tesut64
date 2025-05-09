import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  InputAdornment,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SearchHistory from './SearchHistory';
import RecommendedArtists from './RecommendedArtists';
import PopularArtists from './PopularArtists';

// サンプルデータ
const artists = [
  {
    id: 1,
    name: 'アーティスト1',
    image: 'https://via.placeholder.com/150',
    description: '人気のポップスター',
    genre: 'J-POP',
    tags: ['ポップス', 'バラード', 'ダンス'],
  },
  {
    id: 2,
    name: 'アーティスト2',
    image: 'https://via.placeholder.com/150',
    description: '新進気鋭のロックバンド',
    genre: 'ロック',
    tags: ['ハードロック', 'パンク', 'メタル'],
  },
  {
    id: 3,
    name: 'アーティスト3',
    image: 'https://via.placeholder.com/150',
    description: '人気のアイドルグループ',
    genre: 'アイドル',
    tags: ['アイドル', 'ダンス', 'ポップス'],
  },
];

const genres = ['すべて', 'J-POP', 'ロック', 'アイドル', 'ヒップホップ', 'クラシック'];
const tags = ['ポップス', 'バラード', 'ダンス', 'ハードロック', 'パンク', 'メタル', 'アイドル'];

function ArtistSearch() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('すべて');
  const [selectedTags, setSelectedTags] = useState([]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleGenreChange = (e) => {
    setSelectedGenre(e.target.value);
  };

  const handleTagClick = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleArtistClick = (artistId) => {
    navigate(`/artists/${artistId}`);
  };

  const handleSearchSelect = (search) => {
    setSearchTerm(search.term);
    setSelectedGenre(search.genre);
    setSelectedTags(search.tags);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // 検索履歴に追加
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const newSearch = {
      term: searchTerm,
      genre: selectedGenre,
      tags: selectedTags,
      timestamp: new Date().toISOString(),
    };
    history.unshift(newSearch);
    localStorage.setItem('searchHistory', JSON.stringify(history.slice(0, 10)));
  };

  const filteredArtists = artists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         artist.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = selectedGenre === 'すべて' || artist.genre === selectedGenre;
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tag => artist.tags.includes(tag));
    return matchesSearch && matchesGenre && matchesTags;
  });

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3} sx={{ p: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom align="center">
                アーティスト検索
              </Typography>
              
              <form onSubmit={handleSearchSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      placeholder="アーティスト名や説明で検索"
                      value={searchTerm}
                      onChange={handleSearch}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>ジャンル</InputLabel>
                      <Select
                        value={selectedGenre}
                        label="ジャンル"
                        onChange={handleGenreChange}
                      >
                        {genres.map((genre) => (
                          <MenuItem key={genre} value={genre}>
                            {genre}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          onClick={() => handleTagClick(tag)}
                          color={selectedTags.includes(tag) ? 'primary' : 'default'}
                          clickable
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </form>

              <Grid container spacing={3} sx={{ mt: 2 }}>
                {filteredArtists.map((artist) => (
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
                          <Typography gutterBottom variant="h5" component="div">
                            {artist.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
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
          </Grid>

          <Grid item xs={12} md={4}>
            <SearchHistory onSearchSelect={handleSearchSelect} />
            <RecommendedArtists />
            <PopularArtists />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

export default ArtistSearch; 