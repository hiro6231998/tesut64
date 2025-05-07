import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApp } from 'firebase/app';
import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDocs,
  getDoc,
  serverTimestamp,
  runTransaction,
  orderBy 
} from 'firebase/firestore';
import ErrorLogger from '../utils/errorLogger';

// Firebase Functionsの初期化
const functions = getFunctions(getApp(), 'asia-northeast1');

// キャッシュの設定
const CACHE_TTL = 5 * 60 * 1000; // 5分
const cache = new Map();

// リトライの設定
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

class ApiError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.details = details;
  }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async (operation, context = {}) => {
  let lastError;
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (i < MAX_RETRIES - 1) {
        await sleep(RETRY_DELAY * Math.pow(2, i)); // 指数バックオフ
        continue;
      }
    }
  }
  throw lastError;
};

const handleError = (error, context = {}) => {
  const apiError = new ApiError(
    ErrorLogger.getErrorMessage(error),
    error.code || 'unknown',
    {
      ...context,
      originalError: error
    }
  );
  
  ErrorLogger.logError(apiError, {
    ...context,
    originalError: error
  });
  
  throw apiError;
};

const getCacheKey = (operation, params) => {
  return `${operation}:${JSON.stringify(params)}`;
};

const withCache = async (operation, params, ttl = CACHE_TTL) => {
  const cacheKey = getCacheKey(operation, params);
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const result = await operation();
  cache.set(cacheKey, {
    data: result,
    timestamp: Date.now()
  });
  
  return result;
};

// 予約作成API
export const createReservation = async (eventId, date) => {
  try {
    return await retryOperation(async () => {
      const result = await runTransaction(db, async (transaction) => {
        // イベントの存在確認
        const eventRef = doc(db, 'events', eventId);
        const eventDoc = await transaction.get(eventRef);
        
        if (!eventDoc.exists()) {
          throw new ApiError('イベントが見つかりません', 'not-found');
        }
        
        // 予約可能数の確認
        const event = eventDoc.data();
        const reservationsRef = collection(db, 'reservations');
        const q = query(
          reservationsRef,
          where('eventId', '==', eventId),
          where('date', '==', date),
          where('status', '==', 'confirmed')
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.size >= event.maxParticipants) {
          throw new ApiError('予約可能数を超過しています', 'quota-exceeded');
        }
        
        // 予約の作成
        const reservationData = {
          eventId,
          date,
          status: 'confirmed',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };
        
        const docRef = await addDoc(reservationsRef, reservationData);
        return { id: docRef.id, ...reservationData };
      });
      
      // キャッシュのクリア
      cache.clear();
      return result;
    }, { operation: 'createReservation', eventId, date });
  } catch (error) {
    handleError(error, { operation: 'createReservation', eventId, date });
  }
};

// 予約一覧取得API
export const getReservations = async (userId) => {
  try {
    return await withCache(
      async () => {
        const reservationsRef = collection(db, 'reservations');
        const q = query(
          reservationsRef,
          where('userId', '==', userId),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const reservations = [];
        querySnapshot.forEach((doc) => {
          reservations.push({ id: doc.id, ...doc.data() });
        });
        
        return { reservations };
      },
      { userId },
      CACHE_TTL
    );
  } catch (error) {
    handleError(error, { operation: 'getReservations', userId });
  }
};

// 予約キャンセルAPI
export const cancelReservation = async (reservationId) => {
  try {
    return await retryOperation(async () => {
      const result = await runTransaction(db, async (transaction) => {
        const reservationRef = doc(db, 'reservations', reservationId);
        const reservationDoc = await transaction.get(reservationRef);
        
        if (!reservationDoc.exists()) {
          throw new ApiError('予約が見つかりません', 'not-found');
        }
        
        const reservation = reservationDoc.data();
        if (reservation.status === 'cancelled') {
          throw new ApiError('この予約は既にキャンセルされています', 'invalid-state');
        }
        
        await transaction.update(reservationRef, {
          status: 'cancelled',
          updatedAt: serverTimestamp()
        });
        
        return { id: reservationId, status: 'cancelled' };
      });
      
      // キャッシュのクリア
      cache.clear();
      return result;
    }, { operation: 'cancelReservation', reservationId });
  } catch (error) {
    handleError(error, { operation: 'cancelReservation', reservationId });
  }
};

export const getEvent = async (eventId) => {
  try {
    return await withCache(
      async () => {
        const eventRef = doc(db, 'events', eventId);
        const eventDoc = await getDoc(eventRef);
        
        if (!eventDoc.exists()) {
          throw new ApiError('イベントが見つかりません', 'not-found');
        }
        
        return { id: eventDoc.id, ...eventDoc.data() };
      },
      { eventId },
      CACHE_TTL
    );
  } catch (error) {
    handleError(error, { operation: 'getEvent', eventId });
  }
};

export const updateEvent = async (eventId, data) => {
  try {
    return await retryOperation(async () => {
      const result = await runTransaction(db, async (transaction) => {
        const eventRef = doc(db, 'events', eventId);
        const eventDoc = await transaction.get(eventRef);
        
        if (!eventDoc.exists()) {
          throw new ApiError('イベントが見つかりません', 'not-found');
        }
        
        await transaction.update(eventRef, {
          ...data,
          updatedAt: serverTimestamp()
        });
        
        return { id: eventId, ...data };
      });
      
      // キャッシュのクリア
      cache.clear();
      return result;
    }, { operation: 'updateEvent', eventId, data });
  } catch (error) {
    handleError(error, { operation: 'updateEvent', eventId, data });
  }
};

export const deleteEvent = async (eventId) => {
  try {
    return await retryOperation(async () => {
      const result = await runTransaction(db, async (transaction) => {
        const eventRef = doc(db, 'events', eventId);
        const eventDoc = await transaction.get(eventRef);
        
        if (!eventDoc.exists()) {
          throw new ApiError('イベントが見つかりません', 'not-found');
        }
        
        // 関連する予約の確認
        const reservationsRef = collection(db, 'reservations');
        const q = query(reservationsRef, where('eventId', '==', eventId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          throw new ApiError('このイベントには予約が存在するため削除できません', 'constraint-violation');
        }
        
        await transaction.delete(eventRef);
        return { id: eventId };
      });
      
      // キャッシュのクリア
      cache.clear();
      return result;
    }, { operation: 'deleteEvent', eventId });
  } catch (error) {
    handleError(error, { operation: 'deleteEvent', eventId });
  }
}; 