import React, { useState } from 'react';
import { createReservation } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const ReservationForm = ({ eventId }) => {
  const { user } = useAuth();
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await createReservation(eventId, date);
      setSuccess(true);
      console.log('予約完了:', result);
    } catch (error) {
      setError(error.message);
      console.error('予約エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <p>予約するにはログインが必要です。</p>;
  }

  return (
    <div>
      <h2>予約フォーム</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>予約が完了しました！</p>}
      
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="date">日付:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? '予約中...' : '予約する'}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm; 