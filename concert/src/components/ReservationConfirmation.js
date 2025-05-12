import React, { useState, useRef } from 'react';
import './ReservationConfirmation.css';

const ReservationConfirmation = ({ reservationData, onClose }) => {
  const [showPrintView, setShowPrintView] = useState(false);
  const printRef = useRef(null);
  
  // 予約番号の生成（実際のアプリでは、API応答から取得）
  const reservationNumber = `R${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;
  
  // QRコードの代替画像URL
  const qrCodeUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkCAYAAAAZtYVBAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAO1SURBVHhe7dxBattQFIVhLeUWsoqsJXgJXUJ3lQ10A91Jk0qQkOTZusLw4VPHDvzfzfUHiQRG+Dhq7AvH5XIBIoQEGSFBRkiQERJkhAQZIUFGSJAREiSEBBkhQUZIkBESZIQEGSFBRkiQERJkhAQZIUFGSJAREmSEBBkhQUZIkBESZIQEGSFBRkiQERJkhAQZIUFGSJAREiSEBBkhQUZIkBESZIQEGSFBRkiQERJkhAQZIUHmfyHn9/fz6XT6x/n1/Kn9DjiK3dBzzjnlnHM6fUPJNX/e2w9+93K5/Hj7+fYzpXRqf0/lz9evX87f3767Z8n19XV6enpy78PDw/nDhw/u/fT0tP/MzrPk+fn5y3a7/d6+nsbJZRVhY1EbizpYmFfDm81mcx9/Lr/b9rBxQ8ZCNxZq9fTEbzePj4/vBj1K7pPsW7rRDRkL2Vi4YW+gNxZ/2zNK7jK6IWMBG4s1ypDDvqlWrK/VGS9DHbOUrkfvxhvFfn4cca20Vk4396PnZagjlnJpFO+zNUc5ckDHLOXSKC7WzXqjHDmMY5ZyaRQXa9gZ4cghjlnKpdHgO7g54pGDOmYpl0ZxsVZmz5zjFcM6ZinvDBkX/EeZPXbksMcsZe3c0Sgu2HvOHmvkSMcsZe28dOFH+Xhm9ogjRzu3pb4tN4qL9lGzRxs54rmVlXOXUVy496bO+EE53Lkt9W35OMrHM+vOmELDndtS35YfxcW7NDvKyPHObalf14/iAr419YMZaLhzK/XrelfrfyQTJ48+ctRzW+rb9qO4iK/NTmHQdx+FUbkh46K+NTstfMZHYVSuQj2KC/nWbGLYd78KeimXRnExL82mhd+cX8qlUVzMt2aHhX+3lEujuJiXZv8r/NtfBS0dEBf0tdlh4S9/FLQUF/S12bTw731pyhQX9K3ZYeHfvMJfWvPiov6eTQv/9OtQll46IC7sa7Np4W9/NKX0k/5cXNy/Z4eFnxd/kJjiwv6ZTQs/5ZzP7WuePl48IC7un9lh4ecU/50y9GtclubO7NDw26V0B8TFPcpHDz/X+ubtgDijfNTw2ym5HxAX+Sgj43fD2yG5HbAU+ygj23d//X+XC36Eo4z8I3w3ZCx4Wo0ysn23G7L8Bnj5CdQoRxnZfmYcsqudW8i2u10ahWwr3S6FQrbVbpdCIdvKt0uh0K+hdy0V+v0eepVLofB/ht5rqdAfdOhfLRX6gYf+5ZD4MQ45EIXCOQ4JEIXCOQ4JEIXC+fwLO/Ecu0ggxBEAAAAASUVORK5CYII=';
  
  // 印刷機能
  const handlePrint = () => {
    setShowPrintView(true);
    setTimeout(() => {
      window.print();
      setShowPrintView(false);
    }, 500);
  };
  
  // メール再送機能（実際のアプリではAPIコールを実装）
  const handleResendEmail = () => {
    alert(`確認メールを ${reservationData.customer.email} に再送しました。`);
  };
  
  // チケットをPDFでダウンロード（実際のアプリではPDF生成ロジックを実装）
  const handleDownloadPDF = () => {
    alert('チケットをPDFでダウンロードしています...');
  };
  
  // 日付をフォーマット
  const formatDate = (dateString) => {
    return dateString; // 実際のアプリではDate型を適切にフォーマット
  };
  
  // 支払い方法の表示テキスト
  const getPaymentMethodText = (method) => {
    switch(method) {
      case 'credit': return 'クレジットカード';
      case 'convenience': return 'コンビニ払い';
      case 'bankTransfer': return '銀行振込';
      default: return method;
    }
  };
  
  return (
    <div className={`reservation-confirmation ${showPrintView ? 'print-view' : ''}`}>
      <div className="confirmation-container" ref={printRef}>
        <div className="confirmation-header">
          <h2>予約完了</h2>
          {!showPrintView && (
            <button className="close-button" onClick={onClose}>×</button>
          )}
        </div>
        
        <div className="success-message">
          <div className="success-icon">✓</div>
          <p>予約が完了しました！</p>
          <p>予約確認メールを {reservationData.customer.email} に送信しました。</p>
        </div>
        
        <div className="reservation-number">
          <h3>予約番号</h3>
          <div className="number">{reservationNumber}</div>
        </div>
        
        {reservationData.payment.method === 'electronic' && (
          <div className="qr-code">
            <h3>QRコード</h3>
            <img src={qrCodeUrl} alt="チケットQRコード" />
            <p>会場でこのQRコードをご提示ください</p>
          </div>
        )}
        
        <div className="confirmation-details">
          <div className="detail-section">
            <h3>イベント情報</h3>
            <div className="detail-row">
              <span className="label">コンサート:</span>
              <span className="value">{reservationData.title}</span>
            </div>
            <div className="detail-row">
              <span className="label">日時:</span>
              <span className="value">{formatDate(reservationData.date)} {reservationData.time}</span>
            </div>
            <div className="detail-row">
              <span className="label">会場:</span>
              <span className="value">{reservationData.venue}</span>
            </div>
            <div className="detail-row">
              <span className="label">座席:</span>
              <span className="value">{reservationData.seatCategory} {reservationData.tickets}枚</span>
            </div>
            {reservationData.selectedSeats && reservationData.selectedSeats.length > 0 && (
              <div className="detail-row">
                <span className="label">座席番号:</span>
                <span className="value">{reservationData.selectedSeats.join(', ')}</span>
              </div>
            )}
          </div>
          
          <div className="detail-section">
            <h3>お客様情報</h3>
            <div className="detail-row">
              <span className="label">お名前:</span>
              <span className="value">{reservationData.customer.firstName} {reservationData.customer.lastName}</span>
            </div>
            <div className="detail-row">
              <span className="label">メールアドレス:</span>
              <span className="value">{reservationData.customer.email}</span>
            </div>
            <div className="detail-row">
              <span className="label">電話番号:</span>
              <span className="value">{reservationData.customer.phone}</span>
            </div>
          </div>
          
          <div className="detail-section">
            <h3>お支払い情報</h3>
            <div className="detail-row">
              <span className="label">支払い方法:</span>
              <span className="value">{getPaymentMethodText(reservationData.payment.method)}</span>
            </div>
            {reservationData.payment.method === 'credit' && reservationData.payment.cardNumberLast4 && (
              <div className="detail-row">
                <span className="label">カード番号:</span>
                <span className="value">**** **** **** {reservationData.payment.cardNumberLast4}</span>
              </div>
            )}
            <div className="detail-row price-row">
              <span className="label">合計金額:</span>
              <span className="value price">¥{reservationData.payment.totalAmount.toLocaleString()}</span>
            </div>
          </div>
          
          {reservationData.payment.method === 'convenience' && (
            <div className="payment-instructions">
              <h3>お支払い方法</h3>
              <p>以下の手順でコンビニエンスストアでお支払いください:</p>
              <ol>
                <li>お近くのコンビニエンスストアのレジで「ネット予約の支払い」とお伝えください</li>
                <li>予約番号 {reservationNumber} をお伝えください</li>
                <li>表示された金額をお支払いください</li>
              </ol>
              <p className="warning">※お支払い期限: {new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()} まで</p>
            </div>
          )}
          
          {reservationData.payment.method === 'bankTransfer' && (
            <div className="payment-instructions">
              <h3>お振込先</h3>
              <p>以下の口座に3日以内にお振込みください:</p>
              <div className="bank-details">
                <div className="detail-row">
                  <span className="label">銀行名:</span>
                  <span className="value">コンサート銀行</span>
                </div>
                <div className="detail-row">
                  <span className="label">支店名:</span>
                  <span className="value">渋谷支店（123）</span>
                </div>
                <div className="detail-row">
                  <span className="label">口座種別:</span>
                  <span className="value">普通</span>
                </div>
                <div className="detail-row">
                  <span className="label">口座番号:</span>
                  <span className="value">1234567</span>
                </div>
                <div className="detail-row">
                  <span className="label">口座名義:</span>
                  <span className="value">コンサートチケットシステム</span>
                </div>
                <div className="detail-row">
                  <span className="label">振込金額:</span>
                  <span className="value">¥{reservationData.payment.totalAmount.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <span className="label">振込期限:</span>
                  <span className="value">{new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                </div>
              </div>
              <p className="warning">※振込人名義は予約番号 {reservationNumber} を先頭につけてください</p>
            </div>
          )}
        </div>
        
        {!showPrintView && (
          <div className="action-buttons">
            <button className="action-button print" onClick={handlePrint}>
              印刷する
            </button>
            {reservationData.payment.method === 'electronic' && (
              <button className="action-button download" onClick={handleDownloadPDF}>
                チケットをダウンロード
              </button>
            )}
            <button className="action-button resend" onClick={handleResendEmail}>
              確認メールを再送
            </button>
          </div>
        )}
        
        {!showPrintView && (
          <div className="additional-info">
            <h3>重要なご案内</h3>
            <ul>
              <li>チケットは公演日時の24時間前からご利用いただけます。</li>
              <li>会場での身分証明書の提示が必要な場合があります。</li>
              <li>転売・譲渡は禁止されています。</li>
              <li>コンサート当日は開演の30分前までにご来場ください。</li>
              <li>チケットに関するお問い合わせは、カスタマーサポート（0120-XXX-XXX）までご連絡ください。</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReservationConfirmation; 