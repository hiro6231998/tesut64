import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ja from 'date-fns/locale/ja';

function Calendar() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedVenue, setSelectedVenue] = useState('');

  const timeSlots = [
    '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
    '16:00', '17:00', '18:00', '19:00', '20:00'
  ];

  const venues = [
    '東京ドーム',
    '横浜アリーナ',
    'さいたまスーパーアリーナ',
    '日本武道館',
    '東京体育館'
  ];

  const handleSubmit = () => {
    if (selectedDate && selectedTime && selectedVenue) {
      const booking = {
        id: Date.now(),
        date: selectedDate,
        time: selectedTime,
        venue: selectedVenue,
        name: '',
        email: '',
        phone: '',
        tickets: 1
      };
      
      // ローカルストレージに保存
      const bookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      bookings.push(booking);
      localStorage.setItem('bookings', JSON.stringify(bookings));
      
      // 予約確認ページへ遷移
      navigate(`/booking/${booking.id}`);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ja}>
      <Container maxWidth="md">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Paper elevation={3} sx={{ p: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              予約カレンダー
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <DatePicker
                  label="日付を選択"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  format="yyyy年MM月dd日"
                  sx={{ width: '100%' }}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>時間を選択</InputLabel>
                  <Select
                    value={selectedTime}
                    label="時間を選択"
                    onChange={(e) => setSelectedTime(e.target.value)}
                  >
                    {timeSlots.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>会場を選択</InputLabel>
                  <Select
                    value={selectedVenue}
                    label="会場を選択"
                    onChange={(e) => setSelectedVenue(e.target.value)}
                  >
                    {venues.map((venue) => (
                      <MenuItem key={venue} value={venue}>
                        {venue}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ textAlign: 'center', mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleSubmit}
                    disabled={!selectedDate || !selectedTime || !selectedVenue}
                  >
                    予約を確定
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </Container>
    </LocalizationProvider>
  );
}

export default Calendar; 