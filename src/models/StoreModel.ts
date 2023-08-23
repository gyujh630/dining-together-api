import pool from '../config/dbConfig';

export interface Store {
  storeId?: number; // 자동 생성
  userId: number;
  storeName: string;
  storeImageUrl: string;
  storeContact: string;
  address: {
    province: string; // 도 (경기도)
    city: string; // 시/군/구 (성남시)
    street: string; // 도로명 (분당구 미금일로 74번길 15)
    postalCode: string; // 우편번호 (13627)
  };
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
}

// 가게 추가
export const createStore = async (store: Store): Promise<number> => {
  try {
    const query = `
      INSERT INTO STORE
        (userId, storeName, storeImageUrl, storeContact, address, description, operatingHours, closedDays, foodCategory, maxNum, cost, isParking)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;
    const values = [
      store.userId,
      store.storeName,
      store.storeImageUrl,
      store.storeContact,
      JSON.stringify(store.address),
      store.description,
      store.operatingHours,
      store.closedDays,
      store.foodCategory,
      store.maxNum,
      store.cost,
      store.isParking,
    ];
    const [result] = await pool.query(query, values);
    return (result as any).insertId as number;
  } catch (error) {
    console.error(error);
    throw new Error('Failed to create store');
  }
};

// 가게 전체 조회
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

// 특정 가게 조회
export const getStoreById = async (storeId: number): Promise<Store | null> => {
  try {
    const query = `
      SELECT * FROM STORE WHERE storeId = ?;
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
    const updateFields = Object.entries(updatedStore)
      .filter(([key, value]) => value !== undefined && key !== 'storeId')
      .map(([key]) => `${key} = ?`)
      .join(', ');

    if (!updateFields) {
      throw new Error('No fields to update');
    }

    const updateStoreQuery = `
      UPDATE STORE
      SET ${updateFields}
      WHERE storeId = ?;
    `;

    const values = Object.entries(updatedStore)
      .filter(([key, value]) => value !== undefined && key !== 'storeId')
      .map(([key, value]) => value);

    values.push(storeId);
    await pool.query(updateStoreQuery, values);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to update store');
  }
};

// 가게 삭제(소프트)
export const softDeleteStore = async (storeId: number): Promise<void> => {
  try {
    const query = `
      UPDATE STORE
      SET isDeleted = 1
      WHERE storeId = ?;
    `;
    await pool.query(query, [storeId]);
  } catch (error) {
    console.error(error);
    throw new Error('Failed to soft delete store');
  }
};

// 가게 삭제
/*
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
*/
export default Store;
