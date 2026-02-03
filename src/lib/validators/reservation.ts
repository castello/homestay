import { z } from 'zod';

export const createReservationSchema = z.object({
  accommodationId: z.number(),
  checkInDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  checkOutDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  guests: z.number().min(1),
  couponCode: z.string().optional(),
  specialRequests: z.string().max(500).optional(),
  paymentMethod: z.string(),
});

export const cancelReservationSchema = z.object({
  reservationId: z.number(),
  cancelReason: z.string().min(5, '취소 사유를 5자 이상 입력해주세요.'),
});
