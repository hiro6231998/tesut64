import React, { useState } from 'react';
import './SimpleSearch.css';

const SimpleSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  // サンプルコンサートデータ
  const concerts = [
    { id: 1, title: 'ライジングサン ライブ', venue: '東京ドーム', date: '2025/05/15', price: 8000 },
    { id: 2, title: 'ブルーマン グループ', venue: '大阪城ホール', date: '2025/06/20', price: 7500 },
    { id: 3, title: 'G-DRAGON ワールドツアー', venue: '横浜アリーナ', date: '2025/07/10', price: 12000 },
    { id: 4, title: 'ヒゲダン スペシャルライブ', venue: '名古屋ドーム', date: '2025/08/05', price: 9000 },
    { id: 5, title: '松田聖子 40周年記念コンサート', venue: 'さいたまスーパーアリーナ', date: '2025/09/18', price: 10000 },
    { id: 6, title: '美輪明宏 ファイナルコンサート', venue: '日本武道館', date: '2025/10/25', price: 15000 },
    { id: 7, title: '葉加瀬太郎 バイオリンコンサート', venue: 'サントリーホール', date: '2025/11/12', price: 9500 },
    { id: 8, title: 'コブクロ 20周年記念ライブ', venue: '横浜アリーナ', date: '2025/12/08', price: 8500 },
    { id: 9, title: 'Perfume パフュームライブ', venue: '東京ドーム', date: '2026/01/15', price: 11000 },
    { id: 10, title: 'キタニタツヤ デビューコンサート', venue: 'Zepp Tokyo', date: '2026/02/10', price: 6500 }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }
    
    // 簡易検索機能
    const filtered = concerts.filter(concert => 
      concert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      concert.venue.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    setResults(filtered);
    setHasSearched(true);
  };

  const handleReservation = (concertId) => {
    alert(`コンサートID: ${concertId} の予約画面に進みます`);
    // 実際のアプリでは予約ページに遷移するロジックを実装
  };

  return (
    <div className="simple-search-container">
      <h2>コンサート検索</h2>
      
      <div className="search-box">
        <form onSubmit={handleSearch}>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="アーティスト名や会場で検索"
          />
          <button type="submit">検索</button>
        </form>
      </div>
      
      {hasSearched && (
        <div className="search-results">
          <h3>検索結果: {results.length}件</h3>
          
          {results.length === 0 ? (
            <p className="no-results">検索条件に一致するコンサートが見つかりませんでした。</p>
          ) : (
            <div className="results-list">
              {results.map(concert => (
                <div key={concert.id} className="concert-card">
                  <div className="concert-info">
                    <h4>{concert.title}</h4>
                    <p><strong>会場:</strong> {concert.venue}</p>
                    <p><strong>日付:</strong> {concert.date}</p>
                    <p><strong>料金:</strong> ¥{concert.price.toLocaleString()}</p>
                  </div>
                  <button 
                    className="reserve-button"
                    onClick={() => handleReservation(concert.id)}
                  >
                    予約する
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      <div className="popular-searches">
        <h3>人気の検索</h3>
        <div className="search-tags">
          <button onClick={() => setSearchTerm('ライブ')}>ライブ</button>
          <button onClick={() => setSearchTerm('東京')}>東京</button>
          <button onClick={() => setSearchTerm('コンサート')}>コンサート</button>
          <button onClick={() => setSearchTerm('2025')}>2025年</button>
          <button onClick={() => setSearchTerm('ツアー')}>ツアー</button>
        </div>
      </div>
    </div>
  );
};

export default SimpleSearch; 