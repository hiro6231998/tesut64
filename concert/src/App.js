import React, { useState, useEffect } from 'react';
import './App.css';

// axiosの代わりにfetchを使用
function App() {
  // ページ制御のための状態
  const [currentPage, setCurrentPage] = useState('home');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedConcert, setSelectedConcert] = useState(null);
  const [ticketCount, setTicketCount] = useState(1);
  
  // 予約完了情報を保持
  const [reservationComplete, setReservationComplete] = useState(null);
  
  // ログイン状態管理
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loginError, setLoginError] = useState('');
  
  // フォーム状態
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  
  // 新規会員登録フォームの状態
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  // サンプルユーザーデータ（実際はデータベースから取得）
  const users = [
    { id: 1, name: '田中太郎', email: 'tanaka@example.com', password: 'password123' },
    { id: 2, name: '鈴木花子', email: 'suzuki@example.com', password: 'password123' }
  ];
  
  // サンプルコンサートデータ
  const concerts = [
    { _id: "1", title: '葉加瀬太郎 全国ツアー', venue: '東京ドーム', date: '2025-05-15', price: 8000 },
    { _id: "2", title: 'コブクロ 7月から全国ツアー', venue: '大阪城ホール', date: '2025-07-20', price: 7500 },
    { _id: "3", title: 'Perfume 東京ドーム公演', venue: '東京ドーム', date: '2025-06-10', price: 12000 },
    { _id: "4", title: 'キタニタツヤ 全国ホールツアー', venue: '名古屋ドーム', date: '2025-08-05', price: 9000 }
  ];
  
  // ローカルストレージからログイン状態を復元
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        setIsLoggedIn(true);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);
  
  // 今月の日付を生成
  const generateCalendarDays = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    
    // 先月の日を追加
    for (let i = 0; i < firstDay; i++) {
      days.push({ day: new Date(year, month, 0).getDate() - firstDay + i + 1, currentMonth: false, hasEvent: false });
    }
    
    // 今月の日を追加
    for (let i = 1; i <= daysInMonth; i++) {
      // ランダムにイベントを配置
      const hasEvent = Math.random() > 0.7;
      days.push({ day: i, currentMonth: true, hasEvent });
    }
    
    // 来月の日を追加
    const remainingCells = 7 - (days.length % 7);
    if (remainingCells < 7) {
      for (let i = 1; i <= remainingCells; i++) {
        days.push({ day: i, currentMonth: false, hasEvent: false });
      }
    }
    
    return days;
  };

  // チケット枚数変更処理
  const handleTicketCountChange = (e) => {
    setTicketCount(parseInt(e.target.value));
  };

  // 予約処理
  const handleReservation = () => {
    if (!isLoggedIn) {
      alert('予約にはログインが必要です');
      goToLogin();
      return;
    }
    
    if (!selectedConcert || !selectedDate) {
      alert('コンサートと日付を選択してください');
      return;
    }
    
    // 予約番号の生成（実際はサーバーサイドで行う）
    const reservationNumber = 'R' + Date.now().toString().slice(-8);
    
    // 予約情報の作成
    const reservation = {
      id: reservationNumber,
      concert: selectedConcert,
      date: `${new Date().getFullYear()}年${new Date().getMonth() + 1}月${selectedDate.day}日`,
      user: currentUser,
      tickets: ticketCount,
      totalAmount: selectedConcert.price * ticketCount,
      timestamp: new Date().toISOString()
    };
    
    // 予約情報を保存
    setReservationComplete(reservation);
    
    // 予約完了ページに遷移
    setCurrentPage('reservation-complete');
  };

  // 検索処理
  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setCurrentPage('search');
  };
  
  // ログインフォームの入力処理
  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm({
      ...loginForm,
      [name]: value
    });
  };
  
  // ログイン処理
  const handleLogin = (e) => {
    e.preventDefault();
    setLoginError('');
    
    // デバッグ用：入力値を確認
    console.log('ログイン試行:', loginForm);
    
    // ユーザー認証を簡略化
    if (loginForm.email === 'tanaka@example.com' && loginForm.password === 'password123') {
      // テストユーザーとしてログイン
      const user = {
        id: 1,
        name: '田中太郎',
        email: 'tanaka@example.com'
      };
      
      setCurrentUser(user);
      setIsLoggedIn(true);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentPage('home');
      alert('ログインに成功しました！');
    } else {
      // エラーメッセージ表示
      setLoginError('メールアドレスまたはパスワードが正しくありません');
      // デバッグ用にテスト情報を表示
      console.log('テストアカウント: tanaka@example.com / password123');
    }
  };
  
  // ログアウト処理
  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('currentUser');
  };

  // 新規会員登録フォームの入力処理
  const handleRegisterInputChange = (e) => {
    const { name, value } = e.target;
    setRegisterForm({
      ...registerForm,
      [name]: value
    });
  };

  // 新規会員登録処理
  const handleRegister = (e) => {
    e.preventDefault();
    
    // パスワード一致チェック
    if (registerForm.password !== registerForm.confirmPassword) {
      alert('パスワードと確認用パスワードが一致しません');
      return;
    }
    
    // Eメール重複チェック
    const existingUser = users.find(u => u.email === registerForm.email);
    if (existingUser) {
      alert('このメールアドレスは既に登録されています');
      return;
    }
    
    // 実際はここでAPIを呼び出して登録処理を行う
    alert('新規登録が完了しました！ログイン画面に移動します。');
    setCurrentPage('login');
    
    // ログインフォームに入力済みのメールアドレスをセット
    setLoginForm({
      ...loginForm,
      email: registerForm.email
    });
  };

  // ナビゲーション
  const goToLogin = () => setCurrentPage('login');
  const goToRegister = () => setCurrentPage('register');
  const goToHome = () => setCurrentPage('home');
  const goToCalendar = () => setCurrentPage('calendar');
  const goToSearch = () => setCurrentPage('search');

  // 日付選択ハンドラー
  const handleDateClick = (day) => {
    if (day.currentMonth && day.hasEvent) {
      setSelectedDate(day);
      
      // 選択した日付のコンサートをランダムに選択（実際のアプリでは日付に応じたコンサートを表示）
      const randomConcert = concerts[Math.floor(Math.random() * concerts.length)];
      setSelectedConcert(randomConcert);
    }
  };

  // ホームページの表示
  const renderHomePage = () => (
    <div className="home-page">
      <div className="hero-banner">
        <h1>コンサート予約システム</h1>
        <p>お気に入りのアーティストのコンサートを検索して予約しよう！</p>
        
        <div className="search-container">
          <form onSubmit={handleSearch}>
            <input 
              type="text" 
              placeholder="アーティスト、コンサート名で検索"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit">検索</button>
          </form>
        </div>
      </div>
      
      <div className="featured-concerts">
        <h2>おすすめコンサート</h2>
        <div className="concert-grid">
          {concerts.map(concert => (
            <div key={concert._id} className="concert-card" onClick={() => {
              setSelectedConcert(concert);
              goToCalendar();
            }}>
              <div className="concert-image" style={{ backgroundColor: '#eee' }}></div>
              <div className="concert-info">
                <h3>{concert.title}</h3>
                <p>{concert.venue}</p>
                <p>{concert.date}</p>
                <p className="price">¥{concert.price.toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ログインページの表示
  const renderLoginPage = () => (
    <div className="login-page">
      <div className="login-card">
        <h2>ログイン</h2>
        {loginError && <p className="error-message">{loginError}</p>}
        
        {/* テストアカウント情報を表示 */}
        <div className="test-account-info">
          <p>テストアカウント</p>
          <p>メール: tanaka@example.com</p>
          <p>パスワード: password123</p>
        </div>
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>メールアドレス</label>
            <input 
              type="email" 
              name="email"
              value={loginForm.email}
              onChange={handleLoginInputChange}
              placeholder="メールアドレスを入力" 
              required
            />
          </div>
          <div className="form-group">
            <label>パスワード</label>
            <input 
              type="password" 
              name="password"
              value={loginForm.password}
              onChange={handleLoginInputChange}
              placeholder="パスワードを入力" 
              required
            />
          </div>
          <button type="submit">ログイン</button>
        </form>
        <p className="register-link">
          アカウントをお持ちでない方は <a href="#" onClick={e => { e.preventDefault(); goToRegister(); }}>新規登録</a>
        </p>
        <button className="back-button" onClick={goToHome}>戻る</button>
      </div>
    </div>
  );

  // 新規会員登録ページの表示
  const renderRegisterPage = () => (
    <div className="register-page">
      <div className="register-card">
        <h2>新規会員登録</h2>
        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label>お名前</label>
            <input 
              type="text" 
              name="name"
              value={registerForm.name}
              onChange={handleRegisterInputChange}
              placeholder="お名前を入力" 
              required 
            />
          </div>
          <div className="form-group">
            <label>メールアドレス</label>
            <input 
              type="email" 
              name="email"
              value={registerForm.email}
              onChange={handleRegisterInputChange}
              placeholder="メールアドレスを入力" 
              required 
            />
          </div>
          <div className="form-group">
            <label>パスワード</label>
            <input 
              type="password" 
              name="password"
              value={registerForm.password}
              onChange={handleRegisterInputChange}
              placeholder="パスワードを入力" 
              required 
            />
          </div>
          <div className="form-group">
            <label>パスワード（確認用）</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={registerForm.confirmPassword}
              onChange={handleRegisterInputChange}
              placeholder="パスワードをもう一度入力" 
              required 
            />
          </div>
          <button type="submit">登録する</button>
        </form>
        <p className="login-link">
          既にアカウントをお持ちの方は <a href="#" onClick={e => { e.preventDefault(); goToLogin(); }}>ログイン</a>
        </p>
        <button className="back-button" onClick={goToHome}>戻る</button>
      </div>
    </div>
  );

  // 検索結果ページの表示
  const renderSearchPage = () => (
    <div className="search-page">
      <h2>「{searchTerm || 'すべてのコンサート'}」の検索結果</h2>
      
      <div className="search-results">
        {concerts.map(concert => (
          <div key={concert._id} className="result-item" onClick={() => {
            setSelectedConcert(concert);
            goToCalendar();
          }}>
            <div className="result-image" style={{ backgroundColor: '#eee' }}></div>
            <div className="result-info">
              <h3>{concert.title}</h3>
              <p>{concert.venue}</p>
              <p>{concert.date}</p>
              <p className="price">¥{concert.price.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button className="back-button" onClick={goToHome}>戻る</button>
    </div>
  );

  // カレンダーページの表示
  const renderCalendarPage = () => (
    <div className="calendar-page">
      <h2>コンサート予約カレンダー</h2>
      
      {selectedConcert && (
        <div className="selected-concert">
          <h3>{selectedConcert.title}</h3>
          <p>{selectedConcert.venue}</p>
          <p>{selectedConcert.date}</p>
        </div>
      )}
      
      <div className="calendar">
        <div className="calendar-header">
          <h3>{new Date().getFullYear()}年 {new Date().getMonth() + 1}月</h3>
        </div>
        
        <div className="weekdays">
          <div>日</div>
          <div>月</div>
          <div>火</div>
          <div>水</div>
          <div>木</div>
          <div>金</div>
          <div>土</div>
        </div>
        
        <div className="days">
          {generateCalendarDays().map((day, index) => (
            <div 
              key={index}
              className={`day ${!day.currentMonth ? 'inactive' : ''} ${day.hasEvent ? 'has-event' : ''} ${selectedDate && selectedDate.day === day.day && day.currentMonth ? 'selected' : ''}`}
              onClick={() => handleDateClick(day)}
            >
              {day.day}
              {day.hasEvent && <span className="event-dot"></span>}
            </div>
          ))}
        </div>
      </div>
      
      {selectedDate && selectedConcert && (
        <div className="reservation-form">
          <h3>チケット予約</h3>
          <p>選択した日付: {new Date().getFullYear()}年 {new Date().getMonth() + 1}月 {selectedDate.day}日</p>
          
          <div className="ticket-selection">
            <label>チケット枚数:</label>
            <select value={ticketCount} onChange={handleTicketCountChange}>
              <option value="1">1枚</option>
              <option value="2">2枚</option>
              <option value="3">3枚</option>
              <option value="4">4枚</option>
            </select>
          </div>
          
          <p className="total-price">合計金額: ¥{(selectedConcert.price * ticketCount).toLocaleString()}</p>
          
          {isLoggedIn ? (
            <button className="reserve-button" onClick={handleReservation}>
              予約を確定する
            </button>
          ) : (
            <button className="reserve-button" onClick={() => {
              alert('予約にはログインが必要です');
              goToLogin();
            }}>
              ログインして予約する
            </button>
          )}
        </div>
      )}
      
      <button className="back-button" onClick={goToHome}>戻る</button>
    </div>
  );
  
  // 予約完了ページの表示
  const renderReservationCompletePage = () => (
    <div className="reservation-complete-page">
      <div className="reservation-complete-card">
        <div className="reservation-header">
          <div className="icon-success">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <h2>予約が完了しました！</h2>
        </div>
        
        <div className="reservation-info">
          <div className="info-row">
            <span className="label">予約番号</span>
            <span className="value">{reservationComplete.id}</span>
          </div>
          <div className="info-row">
            <span className="label">コンサート名</span>
            <span className="value">{reservationComplete.concert.title}</span>
          </div>
          <div className="info-row">
            <span className="label">会場</span>
            <span className="value">{reservationComplete.concert.venue}</span>
          </div>
          <div className="info-row">
            <span className="label">日時</span>
            <span className="value">{reservationComplete.date}</span>
          </div>
          <div className="info-row">
            <span className="label">チケット枚数</span>
            <span className="value">{reservationComplete.tickets}枚</span>
          </div>
          <div className="info-row total">
            <span className="label">合計金額</span>
            <span className="value">¥{reservationComplete.totalAmount.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="reservation-actions">
          <button className="ticket-download-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            Eチケットをダウンロード
          </button>
          <button className="email-ticket-btn">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            チケットをメールで送信
          </button>
        </div>
        
        <div className="important-note">
          <p>
            <strong>【重要】</strong> 当日は予約番号または電子チケットをご提示ください。
            開演の30分前までにご来場いただくことをお勧めします。
          </p>
        </div>
        
        <div className="reservation-footer">
          <button className="back-to-home" onClick={goToHome}>トップページに戻る</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-left" onClick={goToHome}>
          <h1>コンサート予約</h1>
        </div>
        <div className="header-right">
          {isLoggedIn ? (
            <div className="user-menu">
              <span className="user-name">{currentUser.name}さん</span>
              <button className="logout-button" onClick={handleLogout}>ログアウト</button>
            </div>
          ) : (
            <button className="login-button" onClick={goToLogin}>ログイン</button>
          )}
        </div>
      </header>
      
      <main className="app-main">
        {currentPage === 'home' && renderHomePage()}
        {currentPage === 'login' && renderLoginPage()}
        {currentPage === 'register' && renderRegisterPage()}
        {currentPage === 'search' && renderSearchPage()}
        {currentPage === 'calendar' && renderCalendarPage()}
        {currentPage === 'reservation-complete' && reservationComplete && renderReservationCompletePage()}
      </main>
    </div>
  );
}

export default App;
