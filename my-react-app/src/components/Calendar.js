import React from 'react';
import styled from 'styled-components';

const CalendarContainer = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const CalendarHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const MonthSelector = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

const MonthButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background: #0056b3;
  }
`;

const MonthTitle = styled.h2`
  margin: 0;
  min-width: 200px;
  text-align: center;
`;

const CalendarGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 0.5rem;
`;

const WeekdayHeader = styled.div`
  text-align: center;
  font-weight: bold;
  padding: 0.5rem;
  color: #666;
`;

const DayCell = styled.div`
  aspect-ratio: 1;
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  text-align: center;
  position: relative;
  background: ${props => props.isSelected ? '#007bff' : 'transparent'};
  color: ${props => props.isSelected ? 'white' : 'inherit'};

  &:hover {
    background: ${props => props.isSelected ? '#0056b3' : '#f0f0f0'};
  }
`;

const EventDot = styled.div`
  width: 6px;
  height: 6px;
  background: #dc3545;
  border-radius: 50%;
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
`;

const Calendar = ({ onDateSelect, events }) => {
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const hasEventsOnDate = (date) => {
    if (!date) return false;
    return events.some(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  const days = getDaysInMonth(currentDate);

  return (
    <CalendarContainer>
      <CalendarHeader>
        <MonthSelector>
          <MonthButton onClick={handlePrevMonth}>前月</MonthButton>
          <MonthTitle>
            {currentDate.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long' })}
          </MonthTitle>
          <MonthButton onClick={handleNextMonth}>次月</MonthButton>
        </MonthSelector>
      </CalendarHeader>

      <CalendarGrid>
        {weekdays.map(day => (
          <WeekdayHeader key={day}>{day}</WeekdayHeader>
        ))}
        {days.map((date, index) => (
          <DayCell
            key={index}
            isSelected={date && date.toDateString() === new Date().toDateString()}
            onClick={() => date && onDateSelect(date)}
          >
            {date ? date.getDate() : ''}
            {date && hasEventsOnDate(date) && <EventDot />}
          </DayCell>
        ))}
      </CalendarGrid>
    </CalendarContainer>
  );
};

export default Calendar; 