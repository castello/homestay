import { z } from 'zod';

export const createReviewSchema = z.object({
  reservationId: z.number(),
  overallRating: z.number().min(1).max(5),
  cleanlinessRating: z.number().min(1).max(5).optional(),
  accuracyRating: z.number().min(1).max(5).optional(),
  communicationRating: z.number().min(1).max(5).optional(),
  locationRating: z.number().min(1).max(5).optional(),
  checkinRating: z.number().min(1).max(5).optional(),
  valueRating: z.number().min(1).max(5).optional(),
  content: z.string().min(20, '리뷰는 20자 이상이어야 합니다.').max(1000),
  privateFeedback: z.string().max(500).optional(),
});

export const hostReplySchema = z.object({
  reviewId: z.number(),
  content: z.string().min(5).max(500),
});
