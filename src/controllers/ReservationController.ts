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
} from '../models/ReservationModel';
import { getStoreById, getUserById } from '../models';
import Place, { getPlaceByPlaceId } from '../models/PlaceModel';
import { findAvailablePlaces } from '../models/PlaceModel';

// 예약 가능 공간 조회
export async function getAvailablePlacesHandler(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { storeId, date, people } = req.query;
    console.log(storeId);
    const parsedStoreId = parseInt(storeId as string, 10);
    const parsedPeople = parseInt(people as string, 10);

    const store = await getStoreById(parsedStoreId);
    if (!store || store.isDeleted) {
      res.status(404).json({ error: 'Store not found' });
    } else if (parsedPeople > store.maxNum || parsedPeople <= 0) {
      res.status(400).json({ error: 'invalid data' });
    } else {
      const availablePlaces = await findAvailablePlaces(
        parsedStoreId,
        date as string,
        parsedPeople
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
    const { userId, placeId, people } = req.body;
    const user = await getUserById(userId);
    const place = await getPlaceByPlaceId(placeId);
    const [storeResult]: any = await pool.query(findStoreIdQuery, [placeId]); // placeId를 사용하여 storeId를 찾기
    if (!user || user.isDeleted) {
      res.status(404).send('User not found');
    } else if (!place || place.isDeleted) {
      res.status(404).send('Place not found');
    } else if (storeResult.length === 0) {
      res.status(404).send('Store not found');
    } else {
      const store: any = await getStoreById(Number(storeResult[0].storeId));
      if (
        people > store.maxNum ||
        people < 1 ||
        people > place.maxPeople ||
        people < place.minPeople
      ) {
        res.status(400).send('인원수가 유효하지 않습니다.');
      } else {
        const newReservation: Reservation = {
          ...req.body, // 기존 필드 유지
          storeId: store.storeId, // storeId 추가
        };
        const reservedId = await createReservation(newReservation);
        res.status(201).json({ reservedId });
      }
    }
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
      res.status(404).send('User not found');
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
    const storeId = parseInt(req.params.storeId, 10);
    const store = await getStoreById(storeId);
    if (!store) {
      res.status(404).send('Store not found');
    } else {
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
    const reserve = await getReservationById(reservedId);
    if (!reserve) {
      res.status(404).json({ error: 'Reservation not found' });
    } else {
      const updatedData: Reservation = req.body;
      await updateReservationById(reservedId, updatedData);
      res.status(200).json({ message: 'Reservation updated successfully' });
    }
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update reservation' });
  }
}
