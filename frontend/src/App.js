import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import CssBaseline from '@mui/material/CssBaseline';
import Login from './components/Login';
import Register from './components/Register';
import ArtistSearch from './components/ArtistSearch';
import ArtistDetail from './components/ArtistDetail';
import FavoriteArtists from './components/FavoriteArtists';
import Calendar from './components/Calendar';
import BookingForm from './components/BookingForm';
import BookingConfirmation from './components/BookingConfirmation';
import BookingHistory from './components/BookingHistory';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/artists" element={<ArtistSearch />} />
          <Route path="/artists/:id" element={<ArtistDetail />} />
          <Route path="/favorites" element={<FavoriteArtists />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/booking" element={<BookingForm />} />
          <Route path="/booking/:bookingId" element={<BookingConfirmation />} />
          <Route path="/history" element={<BookingHistory />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App; 