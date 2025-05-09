import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  ConfirmationNumber as TicketIcon,
} from '@mui/icons-material';

function BookingConfirmation() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);

  useEffect(() => {
    // ローカルストレージから予約情報を取得
    const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    const foundBooking = bookings.find(b => b.id === parseInt(bookingId));
    
    if (foundBooking) {
      setBooking(foundBooking);
    } else {
      navigate('/');
    }
  }, [bookingId, navigate]);

  if (!booking) {
    return null;
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            予約完了
          </Typography>

          <Box sx={{ mt: 4, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              予約内容の確認
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <List>
              <ListItem>
                <ListItemIcon>
                  <EventIcon />
                </ListItemIcon>
                <ListItemText
                  primary="日付"
                  secondary={formatDate(booking.date)}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <AccessTimeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="時間"
                  secondary={booking.time}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <LocationIcon />
                </ListItemIcon>
                <ListItemText
                  primary="会場"
                  secondary={booking.venue}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <PersonIcon />
                </ListItemIcon>
                <ListItemText
                  primary="お名前"
                  secondary={booking.name}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <EmailIcon />
                </ListItemIcon>
                <ListItemText
                  primary="メールアドレス"
                  secondary={booking.email}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <PhoneIcon />
                </ListItemIcon>
                <ListItemText
                  primary="電話番号"
                  secondary={booking.phone}
                />
              </ListItem>

              <ListItem>
                <ListItemIcon>
                  <TicketIcon />
                </ListItemIcon>
                <ListItemText
                  primary="チケット枚数"
                  secondary={`${booking.tickets}枚`}
                />
              </ListItem>
            </List>
          </Box>

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              予約確認メールを送信しました。
              メールをご確認ください。
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/')}
              sx={{ mt: 2 }}
            >
              トップページに戻る
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default BookingConfirmation; 