import { Request, Response } from 'express';
import pool from '../config/dbConfig';
import {
  Reservation,
  createReservation,
  getReservationsByUserId,
  updateReservationById,
  getReservationsByStoreId,
  getAllReservations,
  getReservationById,
  isAvailableReservation,
} from '../models/ReservationModel';
import { getStoreById, getStoreByUserId, getUserById } from '../models';
import {
  getPlaceByPlaceId,
  findAvailablePlacesByDate,
} from '../models/PlaceModel';
import { isDateCloseDay } from '../utils/string-util';

// 예약 가능 공간 조회
export async function getAvailablePlacesHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { storeId, date } = req.query;
    const parsedStoreId = parseInt(storeId as string, 10);
    const store = await getStoreById(parsedStoreId);

    if (!store || store.isDeleted) {
      res.status(404).json({ error: 'Store not found' });
    } else if (isDateCloseDay(date as string, store.closedDays as string)) {
      res.status(200).json({ isHoliday: true }); //휴무일인 경우
    } else {
      const availablePlaces = await findAvailablePlacesByDate(
        parsedStoreId,
        date as string
      );
      res.status(200).json(availablePlaces);
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get available place list' });
  }
}

// 예약 생성
export async function createReservationHandler(
  req: Request,
  res: Response
): Promise<void> {
  const findStoreIdQuery = `
    SELECT storeId
    FROM PLACE
    WHERE placeId = ?
  `;
  try {
    const userId = req.decoded.userId; //토큰에서 가져온 아이디
    const { placeId, people, reservedDate } = req.body;
    const available = await isAvailableReservation(placeId, reservedDate);
    if (!available) {
      res.status(409).json({ error: '이미 예약되어 있는 공간입니다.' });
      return;
    }
    const [storeResult]: any = await pool.query(findStoreIdQuery, [placeId]); // placeId를 사용하여 storeId를 찾기
    if (storeResult.length === 0) {
      res.status(404).json({ error: 'Store not found' });
      return;
    }
    const store: any = await getStoreById(Number(storeResult[0].storeId));
    // 생성
    const newReservation: Reservation = {
      ...req.body, // 기존 필드 유지
      userId: userId,
      storeId: store.storeId, // storeId 추가
    };
    const reservedInfo = await createReservation(newReservation);
    res.status(201).json(reservedInfo);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to create reservation' });
  }
}

// 특정 예약조회
export async function getReservationByIdHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const reservedId: number = parseInt(req.params.reservedId, 10);
    const reservation = await getReservationById(reservedId);
    if (reservation) {
      res.status(200).json(reservation);
    } else {
      res.status(404).json({ error: 'Reservation not found' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reservation by ID' });
  }
}

// 회원의 예약목록조회
export async function getReservationsByUserIdHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = parseInt(req.params.userId, 10);
    const user = await getUserById(userId);
    if (!user) {
      res.status(404).json({ error: 'User not found' });
    } else {
      const reservations = await getReservationsByUserId(userId);
      res.status(200).json(reservations);
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
}

// 가게의 예약목록 조회
export async function getReservationsByStoreIdHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const userId = req.decoded.userId; //토큰에서 가져온 아이디
    const store = await getStoreByUserId(userId);
    if (!store) {
      res.status(404).json({ error: 'Store not found' });
    } else {
      const storeId = store?.storeId as number;
      const reservations = await getReservationsByStoreId(storeId);
      res.status(200).json(reservations);
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch reservations by storeId' });
  }
}

// 전체 예약목록 조회
export async function getAllReservationsHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const reservations = await getAllReservations();
    res.status(200).json(reservations);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch all reservations' });
  }
}

// 예약 수정
export async function updateReservationHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const reservedId: number = parseInt(req.params.reservedId, 10);
    //user 본인 확인
    const updatedData: Reservation = req.body;
    await updateReservationById(reservedId, updatedData);
    res.status(200).json({ message: 'Reservation updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update reservation' });
  }
}
