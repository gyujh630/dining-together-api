import * as StoreModel from '../models/StoreModel';

export const createNewStore = async (
  storeData: StoreModel.Store
): Promise<number> => {
  const storeId = await StoreModel.createStore(storeData);
  return storeId;
};

export const fetchStoreById = async (
  storeId: number
): Promise<StoreModel.Store | null> => {
  const store = await StoreModel.getStoreById(storeId);
  return store;
};
