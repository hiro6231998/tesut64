import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  TextField,
  Rating,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// サンプルデータ
const artistData = {
  id: 1,
  name: 'アーティスト1',
  image: 'https://via.placeholder.com/400',
  description: '人気のポップスター',
  genre: 'J-POP',
  schedule: [
    { date: '2024-05-15', venue: '東京ドーム', time: '19:00' },
    { date: '2024-05-20', venue: '大阪城ホール', time: '18:30' },
    { date: '2024-05-25', venue: '福岡ドーム', time: '19:00' },
  ],
  reviews: [
    { id: 1, user: 'ユーザー1', rating: 5, comment: '素晴らしいパフォーマンスでした！', date: '2024-04-01' },
    { id: 2, user: 'ユーザー2', rating: 4, comment: '期待以上の内容でした。', date: '2024-04-02' },
  ],
};

function ArtistDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [review, setReview] = useState({ rating: 0, comment: '' });

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite);
    // ここでお気に入り登録/解除の処理を実装
    // 例: localStorage.setItem(`favorite_${id}`, !isFavorite);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    // ここでレビュー投稿処理を実装
    console.log('レビュー:', review);
    setReview({ rating: 0, comment: '' });
  };

  const handleBooking = (schedule) => {
    navigate('/calendar', { 
      state: { 
        artistId: id,
        schedule: schedule
      }
    });
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardMedia
                  component="img"
                  height="400"
                  image={artistData.image}
                  alt={artistData.name}
                />
                <CardContent>
                  <Typography variant="h4" gutterBottom>
                    {artistData.name}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" gutterBottom>
                    {artistData.description}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    ジャンル: {artistData.genre}
                  </Typography>
                  <IconButton 
                    onClick={handleFavoriteToggle}
                    color="primary"
                    sx={{ mt: 2 }}
                  >
                    {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={8}>
              <Tabs value={activeTab} onChange={handleTabChange}>
                <Tab label="スケジュール" />
                <Tab label="レビュー" />
              </Tabs>

              {activeTab === 0 && (
                <Box sx={{ mt: 2 }}>
                  <List>
                    {artistData.schedule.map((schedule, index) => (
                      <ListItem
                        key={index}
                        secondaryAction={
                          <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleBooking(schedule)}
                          >
                            予約する
                          </Button>
                        }
                      >
                        <ListItemAvatar>
                          <Avatar>
                            <CalendarTodayIcon />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={`${schedule.date} ${schedule.time}`}
                          secondary={schedule.venue}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}

              {activeTab === 1 && (
                <Box sx={{ mt: 2 }}>
                  <form onSubmit={handleReviewSubmit}>
                    <Box sx={{ mb: 3 }}>
                      <Typography component="legend">評価</Typography>
                      <Rating
                        value={review.rating}
                        onChange={(event, newValue) => {
                          setReview({ ...review, rating: newValue });
                        }}
                      />
                    </Box>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="レビュー"
                      value={review.comment}
                      onChange={(e) => setReview({ ...review, comment: e.target.value })}
                      sx={{ mb: 2 }}
                    />
                    <Button type="submit" variant="contained" color="primary">
                      投稿する
                    </Button>
                  </form>

                  <List sx={{ mt: 4 }}>
                    {artistData.reviews.map((review) => (
                      <ListItem key={review.id} alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>{review.user[0]}</Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Typography component="span" variant="subtitle1">
                                {review.user}
                              </Typography>
                              <Rating value={review.rating} readOnly size="small" sx={{ ml: 1 }} />
                            </Box>
                          }
                          secondary={
                            <>
                              <Typography component="span" variant="body2" color="text.primary">
                                {review.comment}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {review.date}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
}

export default ArtistDetail; 