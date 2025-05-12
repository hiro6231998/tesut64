import React, { useState } from 'react';
import './ArtistSearch.css';

const ArtistSearch = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // 人気アーティスト/ジャンル
  const popularArtists = [
    'ライジングサン', 'ブルーマン', '大阪・関西万博', 'G-DRAGON', 'ヒゲダン', '松田聖子', '美輪明宏'
  ];
  
  // ジャンル
  const genres = [
    { name: 'フェス', image: 'festival.jpg' },
    { name: 'J-POP・邦楽', image: 'jpop.jpg' },
    { name: '洋楽', image: 'western.jpg' },
    { name: 'K-POP・アジア', image: 'kpop.jpg' }
  ];
  
  // おすすめコンサート
  const recommendedConcerts = [
    {
      id: 1,
      title: '葉加瀬太郎 全国ツアー開催中！',
      image: 'hakase.jpg',
      date: '2025年1月〜3月'
    },
    {
      id: 2,
      title: 'コブクロ 7月から全国ツアー開催！',
      image: 'kobukuro.jpg',
      date: '2025年7月〜9月'
    },
    {
      id: 3,
      title: 'Perfume 東京ドーム公演 抽選先行受付中！',
      image: 'perfume.jpg', 
      date: '2025年5月10日〜11日'
    },
    {
      id: 4,
      title: 'キタニタツヤ 全国ホールツアー開催！',
      image: 'kitani.jpg',
      date: '2025年4月〜6月'
    },
    {
      id: 5,
      title: '新しい学校のリーダーズ 武道館公演決定！',
      image: 'leaders.jpg',
      date: '2025年3月15日'
    },
    {
      id: 6,
      title: '土田瑞歩 6月よりツアー開催！',
      image: 'tsuchida.jpg',
      date: '2025年6月〜8月'
    },
    {
      id: 7,
      title: '中野 弥生 語りツアー開催！',
      image: 'nakano.jpg',
      date: '2025年2月〜4月'
    },
    {
      id: 8,
      title: 'TK SONGS RESPECT NIGHT 03',
      image: 'tksongs.jpg',
      date: '2025年1月30日'
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    alert(`「${searchTerm}」の検索結果を表示します`);
    // 実際の実装では、検索結果ページへの遷移やAPIコールを行う
  };

  return (
    <div className="artist-search-container">
      {/* ヘッダー */}
      <div className="search-header">
        <h1>コンサート予約システム</h1>
        <div className="search-bar-container">
          <form onSubmit={handleSearch}>
            <div className="search-bar">
              <input
                type="text"
                placeholder="アーティスト、イベント名で検索"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button type="submit" className="search-button">
                <i className="search-icon">🔍</i>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 人気アーティスト/ジャンルのクイックリンク */}
      <div className="quick-links">
        {popularArtists.map((artist, index) => (
          <button key={index} className="quick-link-button">
            {artist}
          </button>
        ))}
        <button className="more-button">▼</button>
      </div>

      {/* メインナビゲーション */}
      <div className="main-nav">
        <div className="nav-links">
          <a href="#" className="active">コンサート</a>
          <a href="#">スポーツ</a>
          <a href="#">演劇・ステージ</a>
          <a href="#">クラシック・オペラ</a>
          <a href="#">イベント・アート</a>
          <a href="#">レジャー</a>
          <a href="#">映画</a>
          <a href="#">地域スポーツ</a>
          <a href="#">祝祭</a>
          <a href="#">ホテル</a>
          <a href="#">旅行・ホテル</a>
        </div>
      </div>

      {/* ページタイトル */}
      <div className="page-title-banner">
        <div className="page-title-content">
          <h2>コンサート・ライブ</h2>
          <p>コンサート・ライブのチケット情報をお届けします。ロック・フェス、J-POP・邦楽、洋楽、K-POP・アジア、演歌・歌謡曲などのチケットが購入できます。</p>
        </div>
      </div>

      {/* ジャンルから探す */}
      <div className="genre-section">
        <h2>ジャンルから探す</h2>
        <div className="genre-grid">
          {genres.map((genre, index) => (
            <div key={index} className="genre-card">
              <div className="genre-image" style={{ backgroundColor: '#f0f0f0' }}>
                {/* 実際の実装では画像を表示 */}
                <div className="placeholder-image"></div>
              </div>
              <p>{genre.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 注目のコンサート */}
      <div className="featured-concerts">
        <h2>ライブ・コンサートの注目チケット</h2>
        <div className="concert-grid">
          {recommendedConcerts.slice(0, 4).map((concert) => (
            <div key={concert.id} className="concert-card">
              <div className="concert-image" style={{ backgroundColor: '#f0f0f0' }}>
                {/* 実際の実装では画像を表示 */}
                <div className="placeholder-image"></div>
              </div>
              <div className="concert-info">
                <h3>{concert.title}</h3>
                <p>{concert.date}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="concert-grid">
          {recommendedConcerts.slice(4, 8).map((concert) => (
            <div key={concert.id} className="concert-card">
              <div className="concert-image" style={{ backgroundColor: '#f0f0f0' }}>
                {/* 実際の実装では画像を表示 */}
                <div className="placeholder-image"></div>
              </div>
              <div className="concert-info">
                <h3>{concert.title}</h3>
                <p>{concert.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ArtistSearch; 