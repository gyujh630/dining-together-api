import pool from '../config/dbConfig';
import multer from 'multer';
import path from 'path';
import { Request } from 'express';
import { StoreImage } from './StoreImageModel';

// UTC 시간을 한국 시간으로 변환하는 함수
const convertUtcToKoreaTime = (utcDate: Date): Date => {
  const koreaOffset = 9 * 60 * 60 * 1000; // 한국 : UTC+9
  const koreaTime = new Date(utcDate.getTime() + koreaOffset);
  return koreaTime;
};

// 파일 저장 경로 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const extname = path.extname(file.originalname);
    const filename = `${Date.now()}_${Math.floor(
      Math.random() * 10000
    )}${extname}`;
    cb(null, filename);
  },
});

export interface Store {
  storeId?: number; // 자동 생성
  userId: number;
  storeName: string;
  storeContact: string;
  address: {
    postalCode: string; // 우편번호 (12345)
    roadAddress: string; // 도로명주소 (경기도 성남시 분당구 미금일로 74번길 15)
    detailAddress: string; // 상세주소 (205호)
  };
  location: string; // 필터용 지역
  description: string;
  operatingHours: string;
  closedDays: string;
  foodCategory: string;
  maxNum: number;
  cost: number;
  isParking: boolean;
  createdAt?: Date; // 자동 생성
  modifiedAt?: Date; // 자동 업데이트
  averageRating: number;
  reviewCount: number;
  isDeleted: boolean;
  storeImage: StoreImage[]; // STOREIMAGE 테이블의 imageId 배열
}

// 가게 추가
export const createStore = async (store: Store): Promise<number> => {
  try {
    const nowUtc = new Date();
    const koreaCreatedAt = convertUtcToKoreaTime(nowUtc);
    const koreaModifiedAt = koreaCreatedAt;

    const query = `
      INSERT INTO STORE
        (userId, storeName, storeContact, address, location, description, operatingHours, closedDays, foodCategory, maxNum, cost, isParking, createdAt, modifiedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    const values = [
      store.userId,
      store.storeName,
      store.storeContact,
      JSON.stringify(store.address),
      store.location,
      store.description,
      store.operatingHours,
      store.closedDays,
      store.foodCategory,
      store.maxNum,
      store.cost,
      store.isParking,
      koreaCreatedAt,
      koreaModifiedAt,
    ];
    const [result] = await pool.query(query, values);
    return (result as any).insertId as number;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to create store');
  }
};

// 가게 전체 조회(관리자)
export const getAllStores = async (): Promise<Store[]> => {
  try {
    const query = `
      SELECT * FROM STORE;
    `;
    const [rows] = await pool.query(query);
    return rows as Store[];
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch stores');
  }
};

// 가게 전체 조회(사용자)
export const getAllStoresNotDel = async (): Promise<Store[]> => {
  try {
    const query = `
      SELECT * FROM STORE WHERE isDeleted = 0;
    `;
    const [rows] = await pool.query(query);
    return rows as Store[];
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch stores');
  }
};

// 특정 가게 조회
export const getStoreById = async (storeId: number): Promise<Store | null> => {
  try {
    const query = `
      SELECT * FROM STORE WHERE storeId = ? AND isDeleted = 0;
    `;
    const [rows] = await pool.query(query, [storeId]);
    if (Array.isArray(rows) && rows.length > 0) {
      return rows[0] as Store;
    }
    return null;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch store');
  }
};

// 가게 정보 수정
export const updateStore = async (
  storeId: number,
  updatedStore: Store
): Promise<void> => {
  try {
    const nowUtc = new Date();
    const koreaModifiedAt = convertUtcToKoreaTime(nowUtc);

    const updateFields = Object.entries(updatedStore)
      .filter(([key, value]) => value !== undefined && key !== 'storeId')
      .map(([key]) => `${key} = ?`)
      .join(', ');

    if (!updateFields) {
      throw new Error('No fields to update');
    }

    const updateStoreQuery = `
      UPDATE STORE
      SET ${updateFields}, modifiedAt = ?
      WHERE storeId = ?;
    `;

    const values = Object.entries(updatedStore)
      .filter(([key, value]) => value !== undefined && key !== 'storeId')
      .map(([key, value]) => value);

    values.push(koreaModifiedAt, storeId);
    await pool.query(updateStoreQuery, values);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to update store');
  }
};

// 가게 삭제
export const deleteStore = async (storeId: number): Promise<void> => {
  try {
    const query = `
      DELETE FROM STORE WHERE storeId = ?;
    `;
    await pool.query(query, [storeId]);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to delete store');
  }
};

export default Store;
