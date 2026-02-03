import { z } from 'zod';

export const accommodationBasicSchema = z.object({
  name: z.string().min(2, '숙소명은 2자 이상이어야 합니다.').max(100),
  description: z.string().min(20, '설명은 20자 이상이어야 합니다.').max(5000),
  accommodationType: z.string(),
  spaceType: z.string(),
  maxGuests: z.number().min(1).max(50),
  bedrooms: z.number().min(0).max(50),
  beds: z.number().min(1).max(50),
  bathrooms: z.number().min(0).max(50),
});

export const accommodationLocationSchema = z.object({
  address: z.string().min(5),
  addressDetail: z.string().optional(),
  city: z.string().min(1),
  district: z.string().optional(),
  postalCode: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
});

export const accommodationPriceSchema = z.object({
  basePrice: z.number().min(10000, '기본 요금은 10,000원 이상이어야 합니다.'),
  weekendPrice: z.number().optional(),
  cleaningFee: z.number().min(0).optional(),
  extraGuestFee: z.number().min(0).optional(),
  weeklyDiscount: z.number().min(0).max(100).optional(),
  monthlyDiscount: z.number().min(0).max(100).optional(),
});

export const accommodationRulesSchema = z.object({
  checkInTime: z.string(),
  checkOutTime: z.string(),
  minStay: z.number().min(1),
  maxStay: z.number().min(1),
  smokingAllowed: z.boolean(),
  petsAllowed: z.boolean(),
  eventsAllowed: z.boolean(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),
  additionalRules: z.string().optional(),
  cancellationPolicy: z.enum(['flexible', 'moderate', 'strict', 'super_strict']),
});
