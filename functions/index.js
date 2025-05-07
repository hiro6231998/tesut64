const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const { PubSub } = require('@google-cloud/pubsub');
const { RateLimiter } = require('limiter');
const { v4: uuidv4 } = require('uuid');

admin.initializeApp();
const db = getFirestore();
const auth = getAuth();
const pubsub = new PubSub();

// 定数定義
const REGION = 'asia-northeast1';
const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

// エラーコード定義
const ERROR_CODES = {
  INVALID_ARGUMENT: 'invalid-argument',
  NOT_FOUND: 'not-found',
  PERMISSION_DENIED: 'permission-denied',
  RESOURCE_EXHAUSTED: 'resource-exhausted',
  FAILED_PRECONDITION: 'failed-precondition',
  INTERNAL: 'internal'
};

// レート制限設定
const rateLimiters = new Map();
const RATE_LIMIT = {
  RESERVATION: { tokensPerInterval: 10, interval: 'minute' },
  EMAIL: { tokensPerInterval: 100, interval: 'minute' }
};

// キャッシュ設定
const CACHE_TTL = 60 * 5; // 5分
const cache = new Map();
const CACHE_KEYS = {
  USER: (userId) => `user_${userId}`,
  EVENT: (eventId) => `event_${eventId}`,
  RESERVATION: (reservationId) => `reservation_${reservationId}`
};

// リトライ設定
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

// メトリクス設定
const METRICS = {
  RESERVATION_CREATED: 'reservation_created',
  RESERVATION_FAILED: 'reservation_failed',
  EMAIL_SENT: 'email_sent',
  EMAIL_FAILED: 'email_failed',
  CLEANUP_PROCESSED: 'cleanup_processed',
  USER_CREATED: 'user_created',
  CACHE_HIT: 'cache_hit',
  CACHE_MISS: 'cache_miss',
  RATE_LIMIT_EXCEEDED: 'rate_limit_exceeded',
  FUNCTION_EXECUTION_TIME: 'function_execution_time'
};

// ユーティリティ関数
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const getRateLimiter = (type) => {
  if (!rateLimiters.has(type)) {
    rateLimiters.set(type, new RateLimiter(RATE_LIMIT[type]));
  }
  return rateLimiters.get(type);
};

const checkRateLimit = async (type) => {
  const limiter = getRateLimiter(type);
  const hasToken = await limiter.tryRemoveTokens(1);
  if (!hasToken) {
    await recordMetric(METRICS.RATE_LIMIT_EXCEEDED, 1, { type });
    throw new functions.https.HttpsError(ERROR_CODES.RESOURCE_EXHAUSTED, 'レート制限を超えました');
  }
};

const withRetry = async (operation, retries = MAX_RETRIES) => {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error;
      await sleep(RETRY_DELAY * Math.pow(2, i));
    }
  }
};

const recordMetric = async (metricName, value = 1, labels = {}) => {
  try {
    await db.collection('metrics').add({
      name: metricName,
      value,
      labels,
      timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
  } catch (error) {
    console.error('メトリクス記録エラー:', error);
  }
};

const getCachedData = async (key, fetchData, ttl = CACHE_TTL) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < ttl * 1000) {
    await recordMetric(METRICS.CACHE_HIT, 1, { key });
    return cached.data;
  }

  await recordMetric(METRICS.CACHE_MISS, 1, { key });
  const data = await fetchData();
  cache.set(key, { data, timestamp: Date.now() });
  return data;
};

const measureExecutionTime = async (operation, metricName, labels = {}) => {
  const startTime = Date.now();
  try {
    const result = await operation();
    const executionTime = Date.now() - startTime;
    await recordMetric(METRICS.FUNCTION_EXECUTION_TIME, executionTime, {
      ...labels,
      metric: metricName,
      status: 'success'
    });
    return result;
  } catch (error) {
    const executionTime = Date.now() - startTime;
    await recordMetric(METRICS.FUNCTION_EXECUTION_TIME, executionTime, {
      ...labels,
      metric: metricName,
      status: 'error'
    });
    throw error;
  }
};

// バリデーション関数
const validateReservationData = (data) => {
  if (!data.eventId || !data.date) {
    throw new functions.https.HttpsError(ERROR_CODES.INVALID_ARGUMENT, '必要なデータが不足しています');
  }
};

// イベントチェック関数
const checkEventAvailability = async (eventRef) => {
  return await withRetry(async () => {
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
      throw new functions.https.HttpsError(ERROR_CODES.NOT_FOUND, 'イベントが見つかりません');
    }

    const eventData = eventDoc.data();
    if (eventData.availableTickets <= 0) {
      throw new functions.https.HttpsError(ERROR_CODES.FAILED_PRECONDITION, 'チケットが売り切れです');
    }

    return eventData;
  });
};

// HTTPリクエストで呼び出せる関数
exports.createReservation = functions
  .region(REGION)
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB',
    minInstances: 1,
    maxInstances: 10
  })
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(ERROR_CODES.PERMISSION_DENIED, '認証が必要です');
    }

    return await measureExecutionTime(async () => {
      try {
        await checkRateLimit('RESERVATION');
        validateReservationData(data);

        const eventRef = db.collection('events').doc(data.eventId);
        const eventData = await getCachedData(
          CACHE_KEYS.EVENT(data.eventId),
          () => checkEventAvailability(eventRef)
        );

        const result = await withRetry(async () => {
          return await db.runTransaction(async (transaction) => {
            const eventDoc = await transaction.get(eventRef);
            const currentEventData = eventDoc.data();

            if (currentEventData.availableTickets <= 0) {
              throw new functions.https.HttpsError(ERROR_CODES.FAILED_PRECONDITION, 'チケットが売り切れです');
            }

            transaction.update(eventRef, {
              availableTickets: admin.firestore.FieldValue.increment(-1),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            const reservationId = uuidv4();
            const reservationRef = db.collection('reservations').doc(reservationId);
            transaction.set(reservationRef, {
              id: reservationId,
              userId: context.auth.uid,
              eventId: data.eventId,
              date: data.date,
              status: RESERVATION_STATUS.CONFIRMED,
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
              updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return { success: true, reservationId };
          });
        });

        // キャッシュの更新
        cache.delete(CACHE_KEYS.EVENT(data.eventId));

        await recordMetric(METRICS.RESERVATION_CREATED, 1, {
          eventId: data.eventId,
          userId: context.auth.uid
        });

        return { success: true, message: '予約が完了しました', reservationId: result.reservationId };
      } catch (error) {
        await recordMetric(METRICS.RESERVATION_FAILED, 1, {
          eventId: data.eventId,
          error: error.message
        });

        console.error('予約エラー:', error);
        throw new functions.https.HttpsError(ERROR_CODES.INTERNAL, 'エラーが発生しました');
      }
    }, METRICS.RESERVATION_CREATED, { userId: context.auth.uid });
  });

// Firestoreのトリガー関数
exports.onReservationCreated = functions
  .region(REGION)
  .runWith({
    timeoutSeconds: 60,
    memory: '256MB',
    minInstances: 1,
    maxInstances: 10
  })
  .firestore.document('reservations/{reservationId}')
  .onCreate(async (snap, context) => {
    const reservation = snap.data();
    
    return await measureExecutionTime(async () => {
      try {
        await checkRateLimit('EMAIL');
        const batch = db.batch();
        
        const userData = await getCachedData(
          CACHE_KEYS.USER(reservation.userId),
          async () => {
            const userDoc = await db.collection('users').doc(reservation.userId).get();
            return userDoc.data();
          }
        );

        if (!userData) {
          throw new Error('ユーザー情報が見つかりません');
        }

        const mailRef = db.collection('mail').doc();
        batch.set(mailRef, {
          to: userData.email,
          template: {
            name: 'reservation-confirmation',
            data: {
              userName: userData.displayName,
              eventId: reservation.eventId,
              date: reservation.date
            }
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        batch.update(snap.ref, {
          emailSent: true,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await withRetry(async () => await batch.commit());

        await recordMetric(METRICS.EMAIL_SENT, 1, {
          reservationId: context.params.reservationId,
          userId: reservation.userId
        });
      } catch (error) {
        await recordMetric(METRICS.EMAIL_FAILED, 1, {
          reservationId: context.params.reservationId,
          error: error.message
        });

        console.error('メール送信エラー:', error);
        await db.collection('error_logs').add({
          type: 'reservation_email_error',
          reservationId: context.params.reservationId,
          error: error.message,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }, METRICS.EMAIL_SENT, { reservationId: context.params.reservationId });
  });

// 定期実行関数
exports.cleanupExpiredReservations = functions
  .region(REGION)
  .runWith({
    timeoutSeconds: 300,
    memory: '256MB',
    minInstances: 0,
    maxInstances: 1
  })
  .pubsub.schedule('every 24 hours')
  .onRun(async (context) => {
    return await measureExecutionTime(async () => {
      try {
        const expiredDate = new Date();
        expiredDate.setDate(expiredDate.getDate() - 7);

        const snapshot = await db
          .collection('reservations')
          .where('status', '==', RESERVATION_STATUS.PENDING)
          .where('createdAt', '<', expiredDate)
          .limit(500)
          .get();

        if (snapshot.empty) {
          return null;
        }

        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
          batch.update(doc.ref, {
            status: RESERVATION_STATUS.EXPIRED,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          });
        });

        await withRetry(async () => await batch.commit());

        await recordMetric(METRICS.CLEANUP_PROCESSED, snapshot.size);

        await db.collection('cleanup_logs').add({
          processedCount: snapshot.size,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        return null;
      } catch (error) {
        console.error('クリーンアップエラー:', error);
        await db.collection('error_logs').add({
          type: 'cleanup_error',
          error: error.message,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        return null;
      }
    }, METRICS.CLEANUP_PROCESSED);
  });

// Auth トリガー関数
exports.onUserCreated = functions
  .region(REGION)
  .runWith({
    timeoutSeconds: 30,
    memory: '256MB',
    minInstances: 1,
    maxInstances: 10
  })
  .auth.user()
  .onCreate(async (user) => {
    return await measureExecutionTime(async () => {
      try {
        const batch = db.batch();

        const userRef = db.collection('users').doc(user.uid);
        batch.set(userRef, {
          email: user.email,
          displayName: user.displayName || '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          role: 'user',
          isActive: true
        });

        const mailRef = db.collection('mail').doc();
        batch.set(mailRef, {
          to: user.email,
          template: {
            name: 'welcome',
            data: {
              displayName: user.displayName || 'ゲスト'
            }
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        await withRetry(async () => await batch.commit());

        await recordMetric(METRICS.USER_CREATED, 1, {
          userId: user.uid
        });
      } catch (error) {
        console.error('ユーザー作成後の処理エラー:', error);
        await db.collection('error_logs').add({
          type: 'user_creation_error',
          userId: user.uid,
          error: error.message,
          timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }, METRICS.USER_CREATED, { userId: user.uid });
  }); 