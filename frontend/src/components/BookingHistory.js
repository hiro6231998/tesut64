import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Event as EventIcon,
  AccessTime as AccessTimeIcon,
  LocationOn as LocationIcon,
  ConfirmationNumber as TicketIcon,
} from '@mui/icons-material';

function BookingHistory() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    // ローカルストレージから予約情報を取得
    const storedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    setBookings(storedBookings);
  }, []);

  const handleCancelClick = (booking) => {
    setSelectedBooking(booking);
    setOpenDialog(true);
  };

  const handleCancelConfirm = () => {
    if (selectedBooking) {
      // 予約を削除
      const updatedBookings = bookings.filter(b => b.id !== selectedBooking.id);
      setBookings(updatedBookings);
      localStorage.setItem('bookings', JSON.stringify(updatedBookings));
      setOpenDialog(false);
      setSelectedBooking(null);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getStatusColor = (date) => {
    const bookingDate = new Date(date);
    const now = new Date();
    if (bookingDate < now) {
      return 'error';
    }
    return 'success';
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center">
            予約履歴
          </Typography>

          <List>
            {bookings.map((booking) => (
              <React.Fragment key={booking.id}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <EventIcon />
                        <Typography variant="h6">
                          {formatDate(booking.date)}
                        </Typography>
                        <Chip
                          label={new Date(booking.date) < new Date() ? '終了' : '予定'}
                          color={getStatusColor(booking.date)}
                          size="small"
                        />
                      </Box>
                    }
                    secondary={
                      <Box sx={{ mt: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <AccessTimeIcon fontSize="small" />
                          <Typography variant="body2">
                            {booking.time}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          <LocationIcon fontSize="small" />
                          <Typography variant="body2">
                            {booking.venue}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TicketIcon fontSize="small" />
                          <Typography variant="body2">
                            {booking.tickets}枚
                          </Typography>
                        </Box>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    {new Date(booking.date) > new Date() && (
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleCancelClick(booking)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>

          {bookings.length === 0 && (
            <Box sx={{ textAlign: 'center', mt: 4 }}>
              <Typography variant="body1" color="text.secondary">
                予約履歴がありません
              </Typography>
            </Box>
          )}

          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/')}
            >
              トップページに戻る
            </Button>
          </Box>
        </Paper>
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>予約のキャンセル</DialogTitle>
        <DialogContent>
          <Typography>
            この予約をキャンセルしてもよろしいですか？
          </Typography>
          {selectedBooking && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2">
                日付: {formatDate(selectedBooking.date)}
              </Typography>
              <Typography variant="body2">
                時間: {selectedBooking.time}
              </Typography>
              <Typography variant="body2">
                会場: {selectedBooking.venue}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>
            キャンセル
          </Button>
          <Button onClick={handleCancelConfirm} color="error" variant="contained">
            予約をキャンセル
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

export default BookingHistory; 