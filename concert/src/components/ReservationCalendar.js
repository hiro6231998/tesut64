import React, { useState, useEffect } from 'react';
import './ReservationCalendar.css';
import ReservationForm from './ReservationForm';
import ReservationConfirmation from './ReservationConfirmation';

const ReservationCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [concerts, setConcerts] = useState([]);
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  const [reservationSuccess, setReservationSuccess] = useState(false);
  
  // 追加した状態
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [selectedSeatCategory, setSelectedSeatCategory] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [reservationStep, setReservationStep] = useState(1);
  const [showSeatingChart, setShowSeatingChart] = useState(false);
  const [showReservationForm, setShowReservationForm] = useState(false);
  const [reservationDetails, setReservationDetails] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [completedReservation, setCompletedReservation] = useState(null);

  // 月の名前の配列
  const monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  
  // 曜日の名前の配列
  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

  // モックコンサートデータを生成する関数
  const generateMockConcerts = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    // モックデータ用のアーティスト
    const artists = [
      'ライジングサン', 'ブルーマン', 'G-DRAGON', 'ヒゲダン', '松田聖子', 
      '美輪明宏', '葉加瀬太郎', 'コブクロ', 'Perfume', 'キタニタツヤ'
    ];
    
    // モックデータ用の会場
    const venues = [
      '東京ドーム', '横浜アリーナ', '大阪城ホール', '日本武道館', '幕張メッセ',
      'Zepp Tokyo', 'さいたまスーパーアリーナ', '神戸ワールド記念ホール'
    ];
    
    // 座席カテゴリー
    const seatCategories = [
      { name: 'S席', price: 12000, color: '#e53935' },
      { name: 'A席', price: 9000, color: '#1e88e5' },
      { name: 'B席', price: 7000, color: '#43a047' },
      { name: '立見', price: 5000, color: '#f9a825' }
    ];
    
    // 公演時間帯
    const generateTimeSlots = () => {
      const slots = [];
      const numSlots = Math.floor(Math.random() * 2) + 1; // 1〜2つの時間帯
      
      if (numSlots === 1) {
        slots.push({
          id: 'evening',
          label: '夜公演',
          time: '18:30〜',
          doors: '17:30'
        });
      } else {
        slots.push(
          {
            id: 'day',
            label: '昼公演',
            time: '14:00〜',
            doors: '13:00'
          },
          {
            id: 'evening',
            label: '夜公演',
            time: '18:30〜',
            doors: '17:30'
          }
        );
      }
      
      return slots;
    };
    
    const mockConcerts = [];
    
    // 1〜3日おきにランダムにコンサートを配置
    for (let day = 1; day <= new Date(year, month + 1, 0).getDate(); day += Math.floor(Math.random() * 3) + 1) {
      const randomArtist = artists[Math.floor(Math.random() * artists.length)];
      const randomVenue = venues[Math.floor(Math.random() * venues.length)];
      const availableSeats = Math.floor(Math.random() * 100) + 1;
      
      // ランダムに座席カテゴリーを選択（全カテゴリーか一部）
      const availableCategories = [];
      for (const category of seatCategories) {
        if (Math.random() > 0.3) { // 70%の確率でカテゴリーを含める
          availableCategories.push({
            ...category,
            availableSeats: Math.floor(Math.random() * 50) + 1
          });
        }
      }
      
      // 少なくとも1つのカテゴリーを確保
      if (availableCategories.length === 0) {
        availableCategories.push({
          ...seatCategories[0],
          availableSeats: Math.floor(Math.random() * 50) + 1
        });
      }
      
      mockConcerts.push({
        id: `concert-${month}-${day}`,
        date: new Date(year, month, day),
        title: `${randomArtist} コンサート`,
        venue: randomVenue,
        timeSlots: generateTimeSlots(),
        seatCategories: availableCategories,
        totalSeats: availableSeats + Math.floor(Math.random() * 200)
      });
    }
    
    return mockConcerts;
  };

  // 月が変わったらコンサートデータを再生成
  useEffect(() => {
    setConcerts(generateMockConcerts(currentDate));
  }, [currentDate.getMonth(), currentDate.getFullYear()]);

  // 前月に移動
  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    resetSelection();
  };

  // 次月に移動
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    resetSelection();
  };

  // 選択をリセット
  const resetSelection = () => {
    setSelectedDate(null);
    setSelectedConcert(null);
    setSelectedTimeSlot(null);
    setSelectedSeatCategory(null);
    setSelectedSeats([]);
    setReservationStep(1);
    setShowSeatingChart(false);
  };

  // カレンダーのデータを生成
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // 月の初日を取得
    const firstDay = new Date(year, month, 1);
    // 月の末日を取得
    const lastDay = new Date(year, month + 1, 0);
    
    // 月のカレンダー配列を作成
    const daysArray = [];
    
    // 先月の日を追加（カレンダーの空白部分）
    const firstDayOfWeek = firstDay.getDay();
    for (let i = 0; i < firstDayOfWeek; i++) {
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      daysArray.push({
        day: prevMonthLastDay - firstDayOfWeek + i + 1,
        currentMonth: false,
        date: new Date(year, month - 1, prevMonthLastDay - firstDayOfWeek + i + 1)
      });
    }
    
    // 今月の日を追加
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const date = new Date(year, month, i);
      daysArray.push({
        day: i,
        currentMonth: true,
        date: date,
        concerts: concerts.filter(concert => 
          concert.date.getDate() === i && 
          concert.date.getMonth() === month &&
          concert.date.getFullYear() === year
        )
      });
    }
    
    // 来月の日を追加（カレンダーの空白部分）
    const lastDayOfWeek = lastDay.getDay();
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      daysArray.push({
        day: i,
        currentMonth: false,
        date: new Date(year, month + 1, i)
      });
    }
    
    return daysArray;
  };

  // 日付をクリックしたときの処理
  const handleDateClick = (day) => {
    if (day.currentMonth) {
      setSelectedDate(day.date);
      setSelectedConcert(null);
      setSelectedTimeSlot(null);
      setSelectedSeatCategory(null);
      setSelectedSeats([]);
      setReservationStep(1);
      setShowSeatingChart(false);
    }
  };

  // コンサートを選択したときの処理
  const handleConcertSelect = (concert) => {
    setSelectedConcert(concert);
    setTicketCount(1);
    setSelectedTimeSlot(null);
    setSelectedSeatCategory(null);
    setSelectedSeats([]);
    setReservationSuccess(false);
    setReservationStep(1);
    setShowSeatingChart(false);
  };

  // 時間帯を選択したときの処理
  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setReservationStep(2);
  };

  // 座席カテゴリーを選択したときの処理
  const handleSeatCategorySelect = (category) => {
    setSelectedSeatCategory(category);
    setReservationStep(3);
  };

  // 座席を選択したときの処理
  const handleSeatSelect = (seatId) => {
    // 既に選択されている座席か確認
    if (selectedSeats.includes(seatId)) {
      // 選択解除
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else if (selectedSeats.length < ticketCount) {
      // 新しい座席を追加
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  // チケット枚数を変更したときの処理
  const handleTicketCountChange = (e) => {
    const count = parseInt(e.target.value);
    setTicketCount(count);
    
    // チケット枚数を減らす場合、選択座席数を調整
    if (selectedSeats.length > count) {
      setSelectedSeats(selectedSeats.slice(0, count));
    }
  };

  // 座席表示を切り替え
  const toggleSeatingChart = () => {
    setShowSeatingChart(!showSeatingChart);
  };

  // 予約を確定する処理
  const handleReservation = () => {
    if (selectedConcert && selectedTimeSlot && selectedSeatCategory && ticketCount > 0) {
      // 予約フォームに渡す情報を設定
      setReservationDetails({
        title: selectedConcert.title,
        date: `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日`,
        time: selectedTimeSlot.time,
        venue: selectedConcert.venue,
        seatCategory: selectedSeatCategory.name,
        tickets: ticketCount,
        totalPrice: selectedSeatCategory.price * ticketCount,
        selectedSeats: selectedSeats.length > 0 ? selectedSeats : []
      });
      
      // 予約フォームを表示
      setShowReservationForm(true);
    }
  };

  // 予約フォームのキャンセル処理
  const handleCancelReservation = () => {
    setShowReservationForm(false);
  };

  // 予約フォームの送信処理
  const handleSubmitReservation = (formData) => {
    console.log('予約が完了しました:', formData);
    setCompletedReservation(formData);
    setShowReservationForm(false);
    setShowConfirmation(true);
  };

  // 確認画面を閉じる処理
  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    // 必要に応じて他の状態をリセット
    setSelectedConcert(null);
    setSelectedDate(null);
    setReservationStep(1);
  };

  // カレンダーを週ごとに分割
  const getWeeks = () => {
    const days = getDaysInMonth();
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  // モック座席表を生成
  const generateSeatingChart = () => {
    if (!selectedSeatCategory) return null;
    
    const rows = 6;
    const seatsPerRow = 10;
    const seatingChart = [];
    
    // 座席の状態をランダムに生成
    for (let row = 0; row < rows; row++) {
      const rowSeats = [];
      for (let seat = 0; seat < seatsPerRow; seat++) {
        const seatId = `${String.fromCharCode(65 + row)}-${seat + 1}`;
        const isReserved = Math.random() > 0.7; // 30%の確率で予約済み
        
        rowSeats.push({
          id: seatId,
          row: String.fromCharCode(65 + row),
          number: seat + 1,
          reserved: isReserved
        });
      }
      seatingChart.push(rowSeats);
    }
    
    return seatingChart;
  };

  // 座席表の表示
  const renderSeatingChart = () => {
    const seatingChart = generateSeatingChart();
    if (!seatingChart) return null;
    
    return (
      <div className="seating-chart">
        <div className="stage">ステージ</div>
        <div className="seats-container">
          {seatingChart.map((row, rowIndex) => (
            <div key={rowIndex} className="seat-row">
              <div className="row-label">{String.fromCharCode(65 + rowIndex)}</div>
              <div className="seats">
                {row.map((seat) => (
                  <div 
                    key={seat.id}
                    className={`seat ${seat.reserved ? 'reserved' : ''} ${selectedSeats.includes(seat.id) ? 'selected' : ''}`}
                    onClick={() => !seat.reserved && handleSeatSelect(seat.id)}
                  >
                    {seat.number}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="seat-legend">
          <div className="legend-item">
            <div className="legend-color available"></div>
            <span>空席</span>
          </div>
          <div className="legend-item">
            <div className="legend-color reserved"></div>
            <span>予約済</span>
          </div>
          <div className="legend-item">
            <div className="legend-color selected"></div>
            <span>選択中</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="reservation-container">
      <h2>コンサート予約カレンダー</h2>
      
      <div className="calendar-container">
        <div className="calendar-header">
          <button onClick={previousMonth} className="month-nav">&lt;</button>
          <h3>{currentDate.getFullYear()}年 {monthNames[currentDate.getMonth()]}</h3>
          <button onClick={nextMonth} className="month-nav">&gt;</button>
        </div>
        
        <div className="calendar">
          <div className="weekdays">
            {dayNames.map((day, index) => (
              <div key={index} className={index === 0 ? 'sunday' : index === 6 ? 'saturday' : ''}>
                {day}
              </div>
            ))}
          </div>
          
          <div className="days">
            {getWeeks().map((week, weekIndex) => (
              <div key={weekIndex} className="week">
                {week.map((day, dayIndex) => (
                  <div 
                    key={dayIndex} 
                    className={`day ${!day.currentMonth ? 'inactive' : ''} ${
                      selectedDate && 
                      day.date.getDate() === selectedDate.getDate() && 
                      day.date.getMonth() === selectedDate.getMonth() &&
                      day.date.getFullYear() === selectedDate.getFullYear() ? 'selected' : ''
                    } ${day.concerts && day.concerts.length > 0 ? 'has-events' : ''}`}
                    onClick={() => handleDateClick(day)}
                  >
                    <span className="day-number">{day.day}</span>
                    {day.concerts && day.concerts.length > 0 && (
                      <div className="event-indicator">
                        <span>{day.concerts.length}件</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {selectedDate && (
        <div className="concert-list">
          <h3>{selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日のコンサート</h3>
          
          {concerts.filter(concert => 
            concert.date.getDate() === selectedDate.getDate() && 
            concert.date.getMonth() === selectedDate.getMonth() &&
            concert.date.getFullYear() === selectedDate.getFullYear()
          ).length > 0 ? (
            <div className="concert-cards">
              {concerts.filter(concert => 
                concert.date.getDate() === selectedDate.getDate() && 
                concert.date.getMonth() === selectedDate.getMonth() &&
                concert.date.getFullYear() === selectedDate.getFullYear()
              ).map(concert => (
                <div 
                  key={concert.id} 
                  className={`concert-card ${selectedConcert && selectedConcert.id === concert.id ? 'selected' : ''}`}
                  onClick={() => handleConcertSelect(concert)}
                >
                  <h4>{concert.title}</h4>
                  <p>会場: {concert.venue}</p>
                  <p>公演回数: {concert.timeSlots.length}回</p>
                  <p>座席カテゴリー: {concert.seatCategories.length}種類</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-concerts">この日のコンサートはありません</p>
          )}
        </div>
      )}
      
      {selectedConcert && (
        <div className="reservation-form">
          <h3>チケット予約</h3>
          
          {reservationSuccess ? (
            <div className="reservation-success">
              <h4>予約が完了しました！</h4>
              <p>{selectedConcert.title}のチケットを{ticketCount}枚予約しました。</p>
              <p>
                公演日: {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日<br />
                時間: {selectedTimeSlot.time} (開場: {selectedTimeSlot.doors})<br />
                座席: {selectedSeatCategory.name} ¥{selectedSeatCategory.price.toLocaleString()}/1枚<br />
                合計金額: ¥{(selectedSeatCategory.price * ticketCount).toLocaleString()}
              </p>
              {selectedSeats.length > 0 && (
                <p>座席番号: {selectedSeats.join(', ')}</p>
              )}
              <p>予約確認メールが送信されました。</p>
              <button 
                className="new-reservation-button"
                onClick={() => {
                  setSelectedConcert(null);
                  setReservationSuccess(false);
                  setReservationStep(1);
                }}
              >
                新しい予約をする
              </button>
            </div>
          ) : (
            <>
              <div className="concert-details">
                <h4>{selectedConcert.title}</h4>
                <p>日時: {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日</p>
                <p>会場: {selectedConcert.venue}</p>
              </div>
              
              <div className="reservation-steps">
                <div className={`step ${reservationStep >= 1 ? 'active' : ''}`}>1. 時間選択</div>
                <div className={`step ${reservationStep >= 2 ? 'active' : ''}`}>2. 座席選択</div>
                <div className={`step ${reservationStep >= 3 ? 'active' : ''}`}>3. 予約確認</div>
              </div>
              
              {reservationStep === 1 && (
                <div className="time-selection">
                  <h4>公演時間を選択してください</h4>
                  <div className="time-slots">
                    {selectedConcert.timeSlots.map(slot => (
                      <div 
                        key={slot.id}
                        className={`time-slot ${selectedTimeSlot && selectedTimeSlot.id === slot.id ? 'selected' : ''}`}
                        onClick={() => handleTimeSlotSelect(slot)}
                      >
                        <h5>{slot.label}</h5>
                        <p>開演: {slot.time}</p>
                        <p>開場: {slot.doors}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {reservationStep === 2 && (
                <div className="seat-selection">
                  <h4>座席カテゴリーを選択してください</h4>
                  <div className="seat-categories">
                    {selectedConcert.seatCategories.map((category, index) => (
                      <div 
                        key={index}
                        className={`seat-category ${selectedSeatCategory && selectedSeatCategory.name === category.name ? 'selected' : ''}`}
                        onClick={() => handleSeatCategorySelect(category)}
                        style={{ borderColor: category.color }}
                      >
                        <h5>{category.name}</h5>
                        <p>¥{category.price.toLocaleString()}</p>
                        <p className={category.availableSeats < 10 ? 'seats-limited' : ''}>
                          残席: {category.availableSeats}席
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {reservationStep === 3 && (
                <div className="confirmation">
                  <h4>予約内容確認</h4>
                  
                  <div className="reservation-details">
                    <p>
                      公演日: {selectedDate.getFullYear()}年{selectedDate.getMonth() + 1}月{selectedDate.getDate()}日<br />
                      時間: {selectedTimeSlot.time} (開場: {selectedTimeSlot.doors})<br />
                      座席: {selectedSeatCategory.name} (¥{selectedSeatCategory.price.toLocaleString()}/1枚)
                    </p>
                    
                    <div className="ticket-selection">
                      <label htmlFor="ticket-count">チケット枚数:</label>
                      <select 
                        id="ticket-count" 
                        value={ticketCount} 
                        onChange={handleTicketCountChange}
                        disabled={selectedSeatCategory.availableSeats === 0}
                      >
                        {[...Array(Math.min(10, selectedSeatCategory.availableSeats)).keys()].map(i => (
                          <option key={i + 1} value={i + 1}>{i + 1}枚</option>
                        ))}
                      </select>
                    </div>
                    
                    <button 
                      className="toggle-seating-button"
                      onClick={toggleSeatingChart}
                    >
                      {showSeatingChart ? '座席表を閉じる' : '座席表を表示する'}
                    </button>
                    
                    {showSeatingChart && renderSeatingChart()}
                    
                    {selectedSeats.length > 0 && (
                      <div className="selected-seats-summary">
                        <p>選択した座席: {selectedSeats.join(', ')}</p>
                      </div>
                    )}
                    
                    <div className="price-summary">
                      <p>単価: ¥{selectedSeatCategory.price.toLocaleString()}</p>
                      <p>枚数: {ticketCount}枚</p>
                      <p className="total-price">合計: ¥{(selectedSeatCategory.price * ticketCount).toLocaleString()}</p>
                    </div>
                    
                    <button 
                      className="reserve-button"
                      onClick={handleReservation}
                      disabled={selectedSeatCategory.availableSeats === 0 || (showSeatingChart && selectedSeats.length < ticketCount)}
                    >
                      {selectedSeatCategory.availableSeats === 0 ? 
                        '完売しました' : 
                        (showSeatingChart && selectedSeats.length < ticketCount) ?
                        `座席を${ticketCount}席選択してください` :
                        '予約を確定する'
                      }
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
      
      {showReservationForm && (
        <ReservationForm
          concertInfo={reservationDetails}
          onSubmit={handleSubmitReservation}
          onCancel={handleCancelReservation}
        />
      )}
      
      {showConfirmation && completedReservation && (
        <ReservationConfirmation
          reservationData={completedReservation}
          onClose={handleCloseConfirmation}
        />
      )}
    </div>
  );
};

export default ReservationCalendar; 