import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../hooks/useAuth';
import { createReservation } from '../services/api';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
`;

const EventCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const EventHeader = styled.div`
  margin-bottom: 2rem;
`;

const EventTitle = styled.h1`
  margin: 0 0 1rem 0;
`;

const EventInfo = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EventDescription = styled.div`
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
`;

const Button = styled.button`
  background: ${props => props.primary ? '#007bff' : props.danger ? '#dc3545' : '#6c757d'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 1rem;

  &:hover:not(:disabled) {
    background: ${props => props.primary ? '#0056b3' : props.danger ? '#c82333' : '#5a6268'};
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const EventDetailPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [reservationSuccess, setReservationSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchEvent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) {
        throw new Error('イベント情報の取得に失敗しました');
      }
      const data = await response.json();
      setEvent(data);
    } catch (error) {
      setError(error.message);
      console.error('イベント取得エラー:', error);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const handleReservation = async () => {
    if (!user) {
      navigate('/login', { state: { from: `/events/${eventId}` } });
      return;
    }

    if (!selectedDate) {
      setError('日付を選択してください');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await createReservation(eventId, selectedDate);
      setReservationSuccess(true);
      // 予約成功後の処理
      setTimeout(() => {
        navigate('/reservations');
      }, 2000);
    } catch (error) {
      setError(error.message || '予約に失敗しました');
      console.error('予約エラー:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDateValid = useMemo(() => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    const today = new Date();
    return selected >= today;
  }, [selectedDate]);

  const isReservationPossible = useMemo(() => {
    return event?.availableTickets > 0 && isDateValid && !isSubmitting;
  }, [event?.availableTickets, isDateValid, isSubmitting]);

  const handleDelete = async () => {
    if (!user?.isAdmin) return;

    if (!window.confirm('このイベントを削除してもよろしいですか？')) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // TODO: APIでイベントを削除
      navigate('/');
    } catch (error) {
      setError('イベントの削除に失敗しました');
      console.error('削除エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!event) return <div>イベントが見つかりません</div>;

  return (
    <PageContainer>
      <EventCard>
        <EventHeader>
          <EventTitle>{event.title}</EventTitle>
        </EventHeader>

        <EventInfo>
          <InfoItem>
            <strong>日時:</strong>
            <span>{event.date} {event.time}</span>
          </InfoItem>
          <InfoItem>
            <strong>会場:</strong>
            <span>{event.venue}</span>
          </InfoItem>
          <InfoItem>
            <strong>料金:</strong>
            <span>¥{event.price.toLocaleString()}</span>
          </InfoItem>
          <InfoItem>
            <strong>残席:</strong>
            <span>{event.availableTickets}席</span>
          </InfoItem>
        </EventInfo>

        <EventDescription>
          <h3>イベント詳細</h3>
          <p>{event.description}</p>
        </EventDescription>

        <ButtonGroup>
          <Button
            primary
            onClick={handleReservation}
            disabled={!isReservationPossible}
          >
            {isSubmitting ? '処理中...' : 
             event.availableTickets === 0 ? '売り切れ' : 
             '予約する'}
          </Button>
          {user?.isAdmin && (
            <Button
              danger
              onClick={handleDelete}
              disabled={loading}
            >
              削除
            </Button>
          )}
        </ButtonGroup>
      </EventCard>
    </PageContainer>
  );
};

export default EventDetailPage; 