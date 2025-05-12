import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      setError('メールアドレスとパスワードを入力してください');
      return;
    }
    
    console.log('ログイン情報:', { email, password });
    
    // モック認証（デモ用）
    if (email === 'demo@example.com' && password === 'password') {
      console.log('ログイン成功');
    } else {
      setError('メールアドレスまたはパスワードが正しくありません');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h3>ログイン</h3>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">メールアドレス</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="メールアドレスを入力"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">パスワード</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="パスワードを入力"
              required
            />
          </div>
          
          <button type="submit" className="login-button">ログイン</button>
        </form>
        
        <div className="login-footer">
          <p>アカウントをお持ちでない方は <a href="#" id="register-link">新規会員登録</a></p>
        </div>
      </div>
    </div>
  );
};

export default Login; 