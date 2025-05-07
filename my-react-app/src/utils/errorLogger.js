import { db } from '../firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, orderBy, limit } from 'firebase/firestore';

class ErrorLogger {
  static async logError(error, context = {}) {
    try {
      const errorLog = {
        message: error.message,
        code: error.code || 'unknown',
        stack: error.stack,
        context,
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        severity: this.getErrorSeverity(error),
        environment: process.env.NODE_ENV,
        browser: this.getBrowserInfo(),
        device: this.getDeviceInfo()
      };

      // エラーログをFirestoreに保存
      await addDoc(collection(db, 'errorLogs'), errorLog);

      // 開発環境ではコンソールにも出力
      if (process.env.NODE_ENV === 'development') {
        console.error('エラーログ:', errorLog);
      }

      // 重大なエラーの場合は管理者に通知
      if (errorLog.severity === 'critical') {
        await this.notifyAdmin(errorLog);
      }

      return errorLog;
    } catch (loggingError) {
      console.error('エラーログの保存に失敗:', loggingError);
      // フォールバックとしてローカルストレージに保存
      this.saveToLocalStorage(error, context);
    }
  }

  static getErrorSeverity(error) {
    const criticalErrors = [
      'auth/network-request-failed',
      'permission-denied',
      'unavailable'
    ];

    const warningErrors = [
      'auth/too-many-requests',
      'quota-exceeded'
    ];

    if (criticalErrors.includes(error.code)) {
      return 'critical';
    } else if (warningErrors.includes(error.code)) {
      return 'warning';
    }
    return 'error';
  }

  static getBrowserInfo() {
    const ua = navigator.userAgent;
    return {
      userAgent: ua,
      language: navigator.language,
      platform: navigator.platform,
      vendor: navigator.vendor
    };
  }

  static getDeviceInfo() {
    return {
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio
    };
  }

  static async notifyAdmin(errorLog) {
    try {
      // 管理者通知用のコレクションに保存
      await addDoc(collection(db, 'adminNotifications'), {
        type: 'error',
        errorLog,
        timestamp: serverTimestamp(),
        status: 'unread'
      });
    } catch (error) {
      console.error('管理者通知の送信に失敗:', error);
    }
  }

  static saveToLocalStorage(error, context) {
    try {
      const logs = JSON.parse(localStorage.getItem('errorLogs') || '[]');
      logs.push({
        message: error.message,
        code: error.code,
        context,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('errorLogs', JSON.stringify(logs.slice(-50))); // 最新50件のみ保持
    } catch (error) {
      console.error('ローカルストレージへの保存に失敗:', error);
    }
  }

  static async getRecentErrors(limit = 10) {
    try {
      const errorLogsRef = collection(db, 'errorLogs');
      const q = query(
        errorLogsRef,
        orderBy('timestamp', 'desc'),
        limit(limit)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('エラーログの取得に失敗:', error);
      return [];
    }
  }

  static getErrorMessage(error) {
    const errorMessages = {
      // 認証エラー
      'auth/user-not-found': 'ユーザーが見つかりません',
      'auth/wrong-password': 'パスワードが間違っています',
      'auth/invalid-email': '無効なメールアドレスです',
      'auth/email-already-in-use': 'このメールアドレスは既に使用されています',
      'auth/weak-password': 'パスワードが弱すぎます',
      'auth/too-many-requests': '試行回数が多すぎます。しばらく待ってから再試行してください',
      'auth/network-request-failed': 'ネットワーク接続に失敗しました',
      'auth/operation-not-allowed': 'この操作は許可されていません',
      'auth/account-exists-with-different-credential': 'このメールアドレスは別の認証方法で登録されています',

      // データベースエラー
      'permission-denied': 'この操作を実行する権限がありません',
      'not-found': 'リソースが見つかりません',
      'already-exists': 'このリソースは既に存在します',
      'resource-exhausted': 'リソースの制限に達しました',
      'failed-precondition': '操作の前提条件が満たされていません',
      'aborted': '操作が中止されました',
      'out-of-range': '指定された範囲外の値です',
      'unimplemented': 'この操作は実装されていません',
      'internal': '内部エラーが発生しました',
      'unavailable': 'サービスが利用できません',
      'data-loss': 'データが失われました',

      // ネットワークエラー
      'network-error': 'ネットワークエラーが発生しました',
      'timeout': 'タイムアウトが発生しました',
      'quota-exceeded': 'クォータを超過しました',

      // その他
      'unknown': '予期せぬエラーが発生しました'
    };

    return errorMessages[error.code] || error.message || '予期せぬエラーが発生しました';
  }
}

export default ErrorLogger; 