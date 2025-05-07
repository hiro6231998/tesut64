import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { getReservations, cancelReservation } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const SearchSection = styled.div`
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Input = styled.input`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  flex: 1;
  min-width: 200px;
`;

const Select = styled.select`
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
`;

const ReservationCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ReservationInfo = styled.div`
  flex: 1;
`;

const ReservationTitle = styled.h3`
  margin: 0 0 10px 0;
  color: #333;
`;

const ReservationDetail = styled.p`
  margin: 5px 0;
  color: #666;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
  background: ${props => {
    switch (props.status) {
      case 'confirmed': return '#28a745';
      case 'pending': return '#ffc107';
      case 'cancelled': return '#dc3545';
      case 'expired': return '#6c757d';
      default: return '#6c757d';
    }
  }};
  color: white;
`;

const Button = styled.button`
  background: ${props => props.danger ? '#dc3545' : '#6c757d'};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: ${props => props.danger ? '#c82333' : '#5a6268'};
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const ReservationList = () => {
  const { user } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchReservations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getReservations(user.uid);
      setReservations(data.reservations);
    } catch (error) {
      setError(error.message || '予約一覧の取得に失敗しました');
      console.error('予約一覧取得エラー:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchReservations();
  }, [fetchReservations]);

  const handleCancel = useCallback(async (reservationId) => {
    if (!window.confirm('予約をキャンセルしてもよろしいですか？')) {
      return;
    }

    try {
      setIsCancelling(true);
      setError(null);
      await cancelReservation(reservationId);
      await fetchReservations();
    } catch (error) {
      setError(error.message || '予約のキャンセルに失敗しました');
      console.error('予約キャンセルエラー:', error);
    } finally {
      setIsCancelling(false);
    }
  }, [fetchReservations]);

  const filteredReservations = useMemo(() => {
    return reservations.filter(reservation => {
      const matchesSearch = reservation.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
      const matchesDate = dateFilter === 'all' || 
        (dateFilter === 'upcoming' && new Date(reservation.date) > new Date()) ||
        (dateFilter === 'past' && new Date(reservation.date) <= new Date());

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [reservations, searchTerm, statusFilter, dateFilter]);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleStatusFilterChange = useCallback((e) => {
    setStatusFilter(e.target.value);
  }, []);

  const handleDateFilterChange = useCallback((e) => {
    setDateFilter(e.target.value);
  }, []);

  if (!user) {
    return <p>予約一覧を表示するにはログインが必要です。</p>;
  }

  if (loading) {
    return <p>読み込み中...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  return (
    <Container>
      <h2>予約一覧</h2>

      <SearchSection>
        <Input
          type="text"
          placeholder="イベント名で検索..."
          value={searchTerm}
          onChange={handleSearchChange}
        />
        <Select
          value={statusFilter}
          onChange={handleStatusFilterChange}
        >
          <option value="all">すべてのステータス</option>
          <option value="confirmed">予約済み</option>
          <option value="pending">保留中</option>
          <option value="cancelled">キャンセル済み</option>
          <option value="expired">期限切れ</option>
        </Select>
        <Select
          value={dateFilter}
          onChange={handleDateFilterChange}
        >
          <option value="all">すべての日付</option>
          <option value="upcoming">今後の予約</option>
          <option value="past">過去の予約</option>
        </Select>
      </SearchSection>

      {filteredReservations.length === 0 ? (
        <p>予約はありません。</p>
      ) : (
        filteredReservations.map((reservation) => (
          <ReservationCard key={reservation.id}>
            <ReservationInfo>
              <ReservationTitle>{reservation.eventTitle}</ReservationTitle>
              <ReservationDetail>
                日時: {new Date(reservation.date).toLocaleString()}
              </ReservationDetail>
              <ReservationDetail>
                会場: {reservation.venue}
              </ReservationDetail>
              <StatusBadge status={reservation.status}>
                {reservation.status === 'confirmed' && '予約済み'}
                {reservation.status === 'pending' && '保留中'}
                {reservation.status === 'cancelled' && 'キャンセル済み'}
                {reservation.status === 'expired' && '期限切れ'}
              </StatusBadge>
            </ReservationInfo>
            {reservation.status === 'confirmed' && (
              <Button
                danger
                onClick={() => handleCancel(reservation.id)}
                disabled={isCancelling}
              >
                {isCancelling ? 'キャンセル中...' : 'キャンセル'}
              </Button>
            )}
          </ReservationCard>
        ))
      )}
    </Container>
  );
};

export default React.memo(ReservationList); 