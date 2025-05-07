import React from 'react';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const Title = styled.h1`
  margin-bottom: 2rem;
`;

const ReservationList = styled.div`
  display: grid;
  gap: 1rem;
`;

const ReservationCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ReservationInfo = styled.div`
  margin-bottom: 1rem;
`;

const ReservationActions = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  background: ${props => props.danger ? '#dc3545' : '#007bff'};
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: ${props => props.danger ? '#c82333' : '#0056b3'};
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ReservationPage = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const fetchReservations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // TODO: APIから予約一覧を取得
        const mockReservations = [
          {
            id: 1,
            eventTitle: '東京ドームコンサート',
            date: '2024-04-15',
            time: '19:00',
            status: 'confirmed'
          },
          {
            id: 2,
            eventTitle: '横浜アリーナライブ',
            date: '2024-04-20',
            time: '18:30',
            status: 'pending'
          }
        ];
        setReservations(mockReservations);
      } catch (error) {
        setError('予約一覧の取得に失敗しました');
        console.error('予約一覧取得エラー:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchReservations();
    }
  }, [user]);

  const handleCancelReservation = async (reservationId) => {
    try {
      setIsLoading(true);
      setError(null);
      // TODO: APIで予約をキャンセル
      setReservations(prev => 
        prev.map(reservation => 
          reservation.id === reservationId
            ? { ...reservation, status: 'cancelled' }
            : reservation
        )
      );
    } catch (error) {
      setError('予約のキャンセルに失敗しました');
      console.error('予約キャンセルエラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <PageContainer>
        <Title>予約一覧</Title>
        <p>予約一覧を表示するにはログインが必要です。</p>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <Title>予約一覧</Title>
        <p>読み込み中...</p>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Title>予約一覧</Title>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <ReservationList>
        {reservations.length > 0 ? (
          reservations.map(reservation => (
            <ReservationCard key={reservation.id}>
              <ReservationInfo>
                <h3>{reservation.eventTitle}</h3>
                <p>日時: {reservation.date} {reservation.time}</p>
                <p>ステータス: {
                  reservation.status === 'confirmed' ? '確定' :
                  reservation.status === 'pending' ? '保留中' :
                  reservation.status === 'cancelled' ? 'キャンセル済み' :
                  reservation.status
                }</p>
              </ReservationInfo>
              <ReservationActions>
                {reservation.status === 'confirmed' && (
                  <Button
                    danger
                    onClick={() => handleCancelReservation(reservation.id)}
                    disabled={isLoading}
                  >
                    キャンセル
                  </Button>
                )}
              </ReservationActions>
            </ReservationCard>
          ))
        ) : (
          <p>予約はありません</p>
        )}
      </ReservationList>
    </PageContainer>
  );
};

export default ReservationPage; 