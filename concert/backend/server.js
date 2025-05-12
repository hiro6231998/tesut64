const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// ミドルウェア
app.use(cors());
app.use(express.json());

// MongoDBに接続
mongoose.connect('mongodb://127.0.0.1:27017/concert_booking_db')
.then(() => console.log('MongoDB接続成功'))
.catch(err => console.error('MongoDB接続エラー:', err));

// モデル定義
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const concertSchema = new mongoose.Schema({
  title: { type: String, required: true },
  artist: { type: String, required: true },
  venue: { type: String, required: true },
  date: { type: Date, required: true },
  price: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  image: { type: String, default: '' }
});

const reservationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  concert: { type: mongoose.Schema.Types.ObjectId, ref: 'Concert', required: true },
  seats: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  reservationDate: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Concert = mongoose.model('Concert', concertSchema);
const Reservation = mongoose.model('Reservation', reservationSchema);

// ルート
// ユーザー登録
app.post('/api/users/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // ユーザーの存在確認
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'このメールアドレスは既に登録されています' });
    }
    
    // パスワードのハッシュ化
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // 新規ユーザー作成
    const user = new User({
      name,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    res.status(201).json({ message: 'ユーザー登録が完了しました' });
  } catch (error) {
    console.error('登録エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// ログイン
app.post('/api/users/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // ユーザーの検索
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }
    
    // パスワードの検証
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'メールアドレスまたはパスワードが正しくありません' });
    }
    
    // JWTの生成
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email },
      'jwt_secret_key',
      { expiresIn: '1d' }
    );
    
    res.json({
      message: 'ログイン成功',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('ログインエラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// コンサート一覧取得
app.get('/api/concerts', async (req, res) => {
  try {
    const concerts = await Concert.find();
    res.json(concerts);
  } catch (error) {
    console.error('コンサート取得エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// コンサート検索
app.get('/api/concerts/search', async (req, res) => {
  try {
    const { term } = req.query;
    const regex = new RegExp(term, 'i');
    
    const concerts = await Concert.find({
      $or: [
        { title: regex },
        { artist: regex },
        { venue: regex }
      ]
    });
    
    res.json(concerts);
  } catch (error) {
    console.error('コンサート検索エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// コンサート予約
app.post('/api/reservations', async (req, res) => {
  try {
    const { userId, concertId, seats } = req.body;
    
    // コンサート情報取得
    const concert = await Concert.findById(concertId);
    if (!concert) {
      return res.status(404).json({ message: 'コンサートが見つかりません' });
    }
    
    // 座席数確認
    if (concert.availableSeats < seats) {
      return res.status(400).json({ message: '指定された座席数は利用できません' });
    }
    
    // 予約作成
    const reservation = new Reservation({
      user: userId,
      concert: concertId,
      seats,
      totalPrice: concert.price * seats
    });
    
    await reservation.save();
    
    // 利用可能座席数更新
    concert.availableSeats -= seats;
    await concert.save();
    
    res.status(201).json({
      message: '予約が完了しました',
      reservation: {
        id: reservation._id,
        concert: concert.title,
        seats,
        totalPrice: reservation.totalPrice,
        date: concert.date
      }
    });
  } catch (error) {
    console.error('予約エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// サンプルデータ追加用エンドポイント
app.post('/api/sample-data', async (req, res) => {
  try {
    // サンプルコンサート
    const sampleConcerts = [
      {
        title: '葉加瀬太郎 全国ツアー',
        artist: '葉加瀬太郎',
        venue: '東京ドーム',
        date: new Date('2025-05-15'),
        price: 8000,
        availableSeats: 100,
        image: 'hakase.jpg'
      },
      {
        title: 'コブクロ 7月から全国ツアー',
        artist: 'コブクロ',
        venue: '大阪城ホール',
        date: new Date('2025-07-20'),
        price: 7500,
        availableSeats: 150,
        image: 'kobukuro.jpg'
      },
      {
        title: 'Perfume 東京ドーム公演',
        artist: 'Perfume',
        venue: '東京ドーム',
        date: new Date('2025-06-10'),
        price: 12000,
        availableSeats: 200,
        image: 'perfume.jpg'
      },
      {
        title: 'キタニタツヤ 全国ホールツアー',
        artist: 'キタニタツヤ',
        venue: '名古屋ドーム',
        date: new Date('2025-08-05'),
        price: 9000,
        availableSeats: 120,
        image: 'kitani.jpg'
      }
    ];
    
    await Concert.insertMany(sampleConcerts);
    
    res.status(201).json({ message: 'サンプルデータが追加されました' });
  } catch (error) {
    console.error('サンプルデータ追加エラー:', error);
    res.status(500).json({ message: 'サーバーエラーが発生しました' });
  }
});

// サーバー起動
app.listen(PORT, () => {
  console.log(`サーバーが http://localhost:${PORT} で起動しました`);
}); 