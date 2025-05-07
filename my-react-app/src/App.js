import React, { useState, useCallback, useMemo } from 'react';
import Calendar from './components/Calendar';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import ReservationPage from './pages/ReservationPage';
import { useAuth } from './hooks/useAuth';
import EventDetailPage from './pages/EventDetailPage';

const Nav = styled.nav`
  background: #333;
  padding: 1rem;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavLinks = styled.div`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const LogoutButton = styled.button`
  background: transparent;
  border: 1px solid white;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: white;
    color: #333;
  }
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const EventsSection = styled.section`
  margin-top: 2rem;
`;

const EventCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const EventInfo = styled.div`
  flex: 1;
`;

const EventActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const Button = styled.button`
  background: ${props => props.primary ? '#007bff' : props.danger ? '#dc3545' : '#6c757d'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover:not(:disabled) {
    background: ${props => props.primary ? '#0056b3' : props.danger ? '#c82333' : '#5a6268'};
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

function App() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { user, logout } = useAuth();
  const [events, setEvents] = useState([
    {
      id: 1,
      title: '東京ドームコンサート',
      date: '2024-04-15',
      time: '19:00',
      venue: '東京ドーム',
      availableTickets: 100,
      price: 8000,
      description: '人気アーティストのライブコンサート'
    },
    {
      id: 2,
      title: '横浜アリーナライブ',
      date: '2024-04-20',
      time: '18:30',
      venue: '横浜アリーナ',
      availableTickets: 50,
      price: 10000,
      description: '特別な一夜を提供するライブイベント'
    }
  ]);

  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDateSelect = useCallback((date) => {
    setSelectedDate(date);
  }, []);

  const handleReservation = useCallback(async (eventId) => {
    if (!user) {
      alert('予約するにはログインが必要です');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const event = events.find(e => e.id === eventId);
      
      if (!event || event.availableTickets <= 0) {
        throw new Error('チケットが売り切れています');
      }

      setEvents(events.map(e => 
        e.id === eventId 
          ? { ...e, availableTickets: e.availableTickets - 1 }
          : e
      ));

      const newReservation = {
        id: Date.now(),
        eventId,
        userId: user.uid,
        date: new Date().toISOString(),
        status: 'confirmed'
      };

      setReservations(prev => [...prev, newReservation]);
    } catch (error) {
      setError(error.message);
      console.error('予約エラー:', error);
    } finally {
      setIsLoading(false);
    }
  }, [events, user]);

  const handleAddEvent = useCallback((newEvent) => {
    if (!user?.isAdmin) return;
    
    setEvents(prev => [...prev, { 
      ...newEvent, 
      id: Date.now(),
      availableTickets: newEvent.totalTickets || 100
    }]);
  }, [user?.isAdmin]);

  const handleDeleteEvent = useCallback((eventId) => {
    if (!user?.isAdmin) return;
    
    if (!window.confirm('このイベントを削除してもよろしいですか？')) {
      return;
    }

    setEvents(prev => prev.filter(e => e.id !== eventId));
  }, [user?.isAdmin]);

  const selectedEvents = useMemo(() => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === selectedDate.toDateString();
    });
  }, [events, selectedDate]);

  const userReservations = useMemo(() => {
    return reservations.filter(r => r.userId === user?.uid);
  }, [reservations, user?.uid]);

  return (
    <Router>
      <div>
        <Nav>
          <NavLinks>
            <NavLink to="/">ホーム</NavLink>
            <NavLink to="/reservations">予約</NavLink>
          </NavLinks>
          {user ? (
            <LogoutButton onClick={logout}>ログアウト</LogoutButton>
          ) : (
            <NavLink to="/login">ログイン</NavLink>
          )}
        </Nav>

        <MainContent>
          <Routes>
            <Route path="/" element={
              <>
                <header>
                  <h1>コンサート予約カレンダー</h1>
                </header>
                
                <Calendar 
                  onDateSelect={handleDateSelect}
                  events={events}
                />

                <EventsSection>
                  <h2>{selectedDate.toLocaleDateString('ja-JP', { 
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}のイベント</h2>
                  
                  {error && <p style={{ color: 'red' }}>{error}</p>}
                  
                  <div>
                    {selectedEvents.length > 0 ? (
                      selectedEvents.map(event => (
                        <EventCard key={event.id}>
                          <EventInfo>
                            <h3>{event.title}</h3>
                            <p>時間: {event.time}</p>
                            <p>会場: {event.venue}</p>
                            <p>料金: ¥{event.price.toLocaleString()}</p>
                            <p>残席: {event.availableTickets}</p>
                          </EventInfo>
                          <EventActions>
                            <Button 
                              primary 
                              onClick={() => handleReservation(event.id)}
                              disabled={isLoading || event.availableTickets <= 0}
                            >
                              {isLoading ? '処理中...' : '予約する'}
                            </Button>
                            {user?.isAdmin && (
                              <Button 
                                danger 
                                onClick={() => handleDeleteEvent(event.id)}
                              >
                                削除
                              </Button>
                            )}
                          </EventActions>
                        </EventCard>
                      ))
                    ) : (
                      <p>この日のイベントはありません</p>
                    )}
                  </div>
                </EventsSection>
              </>
            } />
            <Route path="/reservations" element={<ReservationPage />} />
            <Route path="/events/:eventId" element={<EventDetailPage />} />
          </Routes>
        </MainContent>
      </div>
    </Router>
  );
}

export default App;
