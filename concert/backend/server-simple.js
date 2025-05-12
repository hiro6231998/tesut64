const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// ミドルウェア
app.use(cors());
app.use(express.json());

// サンプルデータ
const concerts = [
  {
    _id: "1",
    title: '葉加瀬太郎 全国ツアー',
    artist: '葉加瀬太郎',
    venue: '東京ドーム',
    date: '2025-05-15',
    price: 8000,
    availableSeats: 100,
    image: 'hakase.jpg'
  },
  {
    _id: "2",
    title: 'コブクロ 7月から全国ツアー',
    artist: 'コブクロ',
    venue: '大阪城ホール',
    date: '2025-07-20',
    price: 7500,
    availableSeats: 150,
    image: 'kobukuro.jpg'
  },
  {
    _id: "3",
    title: 'Perfume 東京ドーム公演',
    artist: 'Perfume',
    venue: '東京ドーム',
    date: '2025-06-10',
    price: 12000,
    availableSeats: 200,
    image: 'perfume.jpg'
  },
  {
    _id: "4",
    title: 'キタニタツヤ 全国ホールツアー',
    artist: 'キタニタツヤ',
    venue: '名古屋ドーム',
    date: '2025-08-05',
    price: 9000,
    availableSeats: 120,
    image: 'kitani.jpg'
  }
];

// ルート
app.get('/api/concerts', (req, res) => {
  res.json(concerts);
});

app.get('/api/concerts/search', (req, res) => {
  const { term } = req.query;
  if (!term) return res.json(concerts);
  
  const results = concerts.filter(concert => 
    concert.title.toLowerCase().includes(term.toLowerCase()) ||
    concert.artist.toLowerCase().includes(term.toLowerCase()) ||
    concert.venue.toLowerCase().includes(term.toLowerCase())
  );
  
  res.json(results);
});

app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  res.json({
    message: 'ログイン成功',
    token: 'dummy_token',
    user: {
      id: '1',
      name: 'テストユーザー',
      email
    }
  });
});

app.post('/api/users/register', (req, res) => {
  res.status(201).json({ message: 'ユーザー登録が完了しました' });
});

app.post('/api/reservations', (req, res) => {
  const { userId, concertId, seats } = req.body;
  const concert = concerts.find(c => c._id === concertId);
  
  res.status(201).json({
    message: '予約が完了しました',
    reservation: {
      id: Math.floor(Math.random() * 1000),
      concert: concert?.title || 'コンサート',
      seats,
      totalPrice: (concert?.price || 10000) * seats,
      date: concert?.date || '2025-01-01'
    }
  });
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーが http://localhost:${PORT} で起動しました`);
}); 