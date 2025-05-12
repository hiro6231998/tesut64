import React, { useState } from 'react';
import './ReservationForm.css';

const ReservationForm = ({ concertInfo, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    postalCode: '',
    address: '',
    paymentMethod: 'credit',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    agreeTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // エラーをクリア
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // 名前の検証
    if (!formData.firstName.trim()) {
      newErrors.firstName = '姓を入力してください';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = '名を入力してください';
    }
    
    // メールアドレスの検証
    if (!formData.email.trim()) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }
    
    // 電話番号の検証
    if (!formData.phone.trim()) {
      newErrors.phone = '電話番号を入力してください';
    } else if (!/^[0-9-]{10,13}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = '有効な電話番号を入力してください';
    }
    
    // 郵便番号の検証
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = '郵便番号を入力してください';
    } else if (!/^\d{3}-?\d{4}$/.test(formData.postalCode)) {
      newErrors.postalCode = '有効な郵便番号を入力してください (例: 123-4567)';
    }
    
    // 住所の検証
    if (!formData.address.trim()) {
      newErrors.address = '住所を入力してください';
    }
    
    // クレジットカード情報の検証（クレジットカード支払いの場合）
    if (formData.paymentMethod === 'credit') {
      if (!formData.cardNumber.trim()) {
        newErrors.cardNumber = 'カード番号を入力してください';
      } else if (!/^\d{13,19}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        newErrors.cardNumber = '有効なカード番号を入力してください';
      }
      
      if (!formData.cardName.trim()) {
        newErrors.cardName = 'カード名義を入力してください';
      }
      
      if (!formData.expiryDate.trim()) {
        newErrors.expiryDate = '有効期限を入力してください';
      } else if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        newErrors.expiryDate = '有効な有効期限を入力してください (例: 01/25)';
      }
      
      if (!formData.cvv.trim()) {
        newErrors.cvv = 'セキュリティコードを入力してください';
      } else if (!/^\d{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = '有効なセキュリティコードを入力してください';
      }
    }
    
    // 利用規約の同意
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = '利用規約に同意してください';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // 実際のアプリケーションではAPIコールを行う
      await new Promise(resolve => setTimeout(resolve, 1500)); // 処理中の表示のための遅延
      
      // 予約情報と個人情報をマージ
      const reservationData = {
        ...concertInfo,
        customer: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          postalCode: formData.postalCode,
          address: formData.address
        },
        payment: {
          method: formData.paymentMethod,
          ...(formData.paymentMethod === 'credit' && {
            cardNumberLast4: formData.cardNumber.slice(-4),
            cardName: formData.cardName
          })
        }
      };
      
      onSubmit(reservationData);
    } catch (error) {
      console.error('予約処理中にエラーが発生しました', error);
      setErrors({
        submit: '予約処理中にエラーが発生しました。もう一度お試しください。'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="reservation-form-container">
      <div className="reservation-form-header">
        <h3>お客様情報入力</h3>
        <div className="concert-summary">
          <p><strong>{concertInfo.title}</strong></p>
          <p>日時: {concertInfo.date} {concertInfo.time}</p>
          <p>会場: {concertInfo.venue}</p>
          <p>座席: {concertInfo.seatCategory} {concertInfo.tickets}枚</p>
          <p className="form-price">合計: ¥{concertInfo.totalPrice.toLocaleString()}</p>
        </div>
      </div>
      
      {errors.submit && <div className="form-error-message">{errors.submit}</div>}
      
      <form onSubmit={handleSubmit} className="reservation-form">
        <div className="form-section">
          <h4>お客様情報</h4>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">姓 <span className="required">*</span></label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="山田"
                disabled={isProcessing}
              />
              {errors.firstName && <div className="error-text">{errors.firstName}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="lastName">名 <span className="required">*</span></label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="太郎"
                disabled={isProcessing}
              />
              {errors.lastName && <div className="error-text">{errors.lastName}</div>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="email">メールアドレス <span className="required">*</span></label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
              disabled={isProcessing}
            />
            {errors.email && <div className="error-text">{errors.email}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">電話番号 <span className="required">*</span></label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="090-1234-5678"
              disabled={isProcessing}
            />
            {errors.phone && <div className="error-text">{errors.phone}</div>}
          </div>
        </div>
        
        <div className="form-section">
          <h4>お届け先情報</h4>
          
          <div className="form-group">
            <label htmlFor="postalCode">郵便番号 <span className="required">*</span></label>
            <input
              type="text"
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="123-4567"
              disabled={isProcessing}
            />
            {errors.postalCode && <div className="error-text">{errors.postalCode}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="address">住所 <span className="required">*</span></label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="東京都渋谷区〇〇町1-2-3"
              disabled={isProcessing}
            />
            {errors.address && <div className="error-text">{errors.address}</div>}
          </div>
        </div>
        
        <div className="form-section">
          <h4>お支払い方法</h4>
          
          <div className="payment-methods">
            <div className="payment-method">
              <input
                type="radio"
                id="credit"
                name="paymentMethod"
                value="credit"
                checked={formData.paymentMethod === 'credit'}
                onChange={handleChange}
                disabled={isProcessing}
              />
              <label htmlFor="credit">クレジットカード</label>
            </div>
            
            <div className="payment-method">
              <input
                type="radio"
                id="convenience"
                name="paymentMethod"
                value="convenience"
                checked={formData.paymentMethod === 'convenience'}
                onChange={handleChange}
                disabled={isProcessing}
              />
              <label htmlFor="convenience">コンビニ払い</label>
            </div>
          </div>
          
          {formData.paymentMethod === 'credit' && (
            <div className="credit-card-details">
              <div className="form-group">
                <label htmlFor="cardNumber">カード番号 <span className="required">*</span></label>
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleChange}
                  placeholder="1234 5678 9012 3456"
                  disabled={isProcessing}
                />
                {errors.cardNumber && <div className="error-text">{errors.cardNumber}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="cardName">カード名義 <span className="required">*</span></label>
                <input
                  type="text"
                  id="cardName"
                  name="cardName"
                  value={formData.cardName}
                  onChange={handleChange}
                  placeholder="TARO YAMADA"
                  disabled={isProcessing}
                />
                {errors.cardName && <div className="error-text">{errors.cardName}</div>}
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="expiryDate">有効期限 <span className="required">*</span></label>
                  <input
                    type="text"
                    id="expiryDate"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    disabled={isProcessing}
                  />
                  {errors.expiryDate && <div className="error-text">{errors.expiryDate}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="cvv">セキュリティコード <span className="required">*</span></label>
                  <input
                    type="text"
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleChange}
                    placeholder="123"
                    disabled={isProcessing}
                  />
                  {errors.cvv && <div className="error-text">{errors.cvv}</div>}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="form-group checkbox-group">
          <input
            type="checkbox"
            id="agreeTerms"
            name="agreeTerms"
            checked={formData.agreeTerms}
            onChange={handleChange}
            disabled={isProcessing}
          />
          <label htmlFor="agreeTerms">
            <a href="/terms" target="_blank" rel="noopener noreferrer">利用規約</a>に同意します
          </label>
          {errors.agreeTerms && <div className="error-text">{errors.agreeTerms}</div>}
        </div>
        
        <div className="form-actions">
          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
            disabled={isProcessing}
          >
            戻る
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isProcessing}
          >
            {isProcessing ? '処理中...' : '予約を確定する'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReservationForm; 