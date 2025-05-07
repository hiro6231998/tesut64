import { 
  createReservation,
  getReservations,
  cancelReservation,
  getEvent,
  updateEvent,
  deleteEvent
} from '../api';
import { db } from '../../firebase';
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
  runTransaction 
} from 'firebase/firestore';
import ErrorLogger from '../../utils/errorLogger';

// Firestoreのモック
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  addDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  getDoc: jest.fn(),
  runTransaction: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  orderBy: jest.fn()
}));

// ErrorLoggerのモック
jest.mock('../../utils/errorLogger', () => ({
  logError: jest.fn(),
  getErrorMessage: jest.fn(error => error.message)
}));

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createReservation', () => {
    const mockEventId = 'event1';
    const mockDate = '2024-03-20';
    const mockEvent = {
      maxParticipants: 10
    };
    const mockReservation = {
      id: 'reservation1',
      eventId: mockEventId,
      date: mockDate,
      status: 'confirmed'
    };

    it('予約を作成できること', async () => {
      // モックの設定
      runTransaction.mockImplementation(async (callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => mockEvent
          }),
          update: jest.fn()
        };
        return callback(transaction);
      });

      getDocs.mockResolvedValue({
        size: 5,
        forEach: jest.fn()
      });

      addDoc.mockResolvedValue({
        id: mockReservation.id
      });

      const result = await createReservation(mockEventId, mockDate);
      expect(result).toEqual(expect.objectContaining(mockReservation));
    });

    it('イベントが存在しない場合はエラーを投げること', async () => {
      runTransaction.mockImplementation(async (callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue({
            exists: () => false
          })
        };
        return callback(transaction);
      });

      await expect(createReservation(mockEventId, mockDate))
        .rejects
        .toThrow('イベントが見つかりません');
    });

    it('予約可能数を超過している場合はエラーを投げること', async () => {
      runTransaction.mockImplementation(async (callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => mockEvent
          })
        };
        return callback(transaction);
      });

      getDocs.mockResolvedValue({
        size: 10,
        forEach: jest.fn()
      });

      await expect(createReservation(mockEventId, mockDate))
        .rejects
        .toThrow('予約可能数を超過しています');
    });
  });

  describe('getReservations', () => {
    const mockUserId = 'user1';
    const mockReservations = [
      { id: 'reservation1', userId: mockUserId },
      { id: 'reservation2', userId: mockUserId }
    ];

    it('ユーザーの予約一覧を取得できること', async () => {
      getDocs.mockResolvedValue({
        forEach: (callback) => mockReservations.forEach(callback)
      });

      const result = await getReservations(mockUserId);
      expect(result.reservations).toEqual(mockReservations);
    });

    it('キャッシュが機能すること', async () => {
      getDocs.mockResolvedValue({
        forEach: (callback) => mockReservations.forEach(callback)
      });

      // 1回目の呼び出し
      await getReservations(mockUserId);
      // 2回目の呼び出し
      await getReservations(mockUserId);

      // getDocsは1回だけ呼ばれるはず
      expect(getDocs).toHaveBeenCalledTimes(1);
    });
  });

  describe('cancelReservation', () => {
    const mockReservationId = 'reservation1';
    const mockReservation = {
      id: mockReservationId,
      status: 'confirmed'
    };

    it('予約をキャンセルできること', async () => {
      runTransaction.mockImplementation(async (callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => mockReservation
          }),
          update: jest.fn()
        };
        return callback(transaction);
      });

      const result = await cancelReservation(mockReservationId);
      expect(result.status).toBe('cancelled');
    });

    it('予約が存在しない場合はエラーを投げること', async () => {
      runTransaction.mockImplementation(async (callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue({
            exists: () => false
          })
        };
        return callback(transaction);
      });

      await expect(cancelReservation(mockReservationId))
        .rejects
        .toThrow('予約が見つかりません');
    });

    it('既にキャンセル済みの場合はエラーを投げること', async () => {
      runTransaction.mockImplementation(async (callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => ({ ...mockReservation, status: 'cancelled' })
          })
        };
        return callback(transaction);
      });

      await expect(cancelReservation(mockReservationId))
        .rejects
        .toThrow('この予約は既にキャンセルされています');
    });
  });

  describe('getEvent', () => {
    const mockEventId = 'event1';
    const mockEvent = {
      id: mockEventId,
      title: 'テストイベント',
      maxParticipants: 10
    };

    it('イベント情報を取得できること', async () => {
      getDoc.mockResolvedValue({
        exists: () => true,
        id: mockEventId,
        data: () => mockEvent
      });

      const result = await getEvent(mockEventId);
      expect(result).toEqual(mockEvent);
    });

    it('イベントが存在しない場合はエラーを投げること', async () => {
      getDoc.mockResolvedValue({
        exists: () => false
      });

      await expect(getEvent(mockEventId))
        .rejects
        .toThrow('イベントが見つかりません');
    });
  });

  describe('updateEvent', () => {
    const mockEventId = 'event1';
    const mockUpdateData = {
      title: '更新されたイベント',
      maxParticipants: 20
    };

    it('イベント情報を更新できること', async () => {
      runTransaction.mockImplementation(async (callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue({
            exists: () => true
          }),
          update: jest.fn()
        };
        return callback(transaction);
      });

      const result = await updateEvent(mockEventId, mockUpdateData);
      expect(result).toEqual(expect.objectContaining(mockUpdateData));
    });

    it('イベントが存在しない場合はエラーを投げること', async () => {
      runTransaction.mockImplementation(async (callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue({
            exists: () => false
          })
        };
        return callback(transaction);
      });

      await expect(updateEvent(mockEventId, mockUpdateData))
        .rejects
        .toThrow('イベントが見つかりません');
    });
  });

  describe('deleteEvent', () => {
    const mockEventId = 'event1';

    it('イベントを削除できること', async () => {
      runTransaction.mockImplementation(async (callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue({
            exists: () => true
          }),
          delete: jest.fn()
        };
        return callback(transaction);
      });

      getDocs.mockResolvedValue({
        empty: true
      });

      const result = await deleteEvent(mockEventId);
      expect(result.id).toBe(mockEventId);
    });

    it('イベントが存在しない場合はエラーを投げること', async () => {
      runTransaction.mockImplementation(async (callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue({
            exists: () => false
          })
        };
        return callback(transaction);
      });

      await expect(deleteEvent(mockEventId))
        .rejects
        .toThrow('イベントが見つかりません');
    });

    it('関連する予約が存在する場合はエラーを投げること', async () => {
      runTransaction.mockImplementation(async (callback) => {
        const transaction = {
          get: jest.fn().mockResolvedValue({
            exists: () => true
          })
        };
        return callback(transaction);
      });

      getDocs.mockResolvedValue({
        empty: false
      });

      await expect(deleteEvent(mockEventId))
        .rejects
        .toThrow('このイベントには予約が存在するため削除できません');
    });
  });
}); 