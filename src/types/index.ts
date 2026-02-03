export type UserRole = 'guest' | 'host' | 'admin';
export type AccommodationType = 'apartment' | 'house' | 'hanok' | 'guesthouse' | 'villa' | 'pension' | 'farmstay' | 'other';
export type SpaceType = 'entire' | 'private' | 'shared';
export type CancellationPolicy = 'flexible' | 'moderate' | 'strict';
export type ReservationStatus = 'requested' | 'pending_host_approval' | 'pending_payment' | 'confirmed' | 'checked_in' | 'checked_out' | 'completed' | 'host_rejected' | 'guest_cancelled' | 'host_cancelled' | 'refunding';
export type ReviewType = 'guest_to_accommodation' | 'host_to_guest';
export type ReviewCategory = 'cleanliness' | 'accuracy' | 'communication' | 'location' | 'checkin' | 'value';

export interface SearchParams {
  keyword?: string;
  checkin?: string;
  checkout?: string;
  adults?: number;
  children?: number;
  infants?: number;
  minPrice?: number;
  maxPrice?: number;
  accommodationType?: string[];
  spaceType?: string[];
  amenities?: number[];
  minBedrooms?: number;
  minBathrooms?: number;
  instantBooking?: boolean;
  superhost?: boolean;
  petAllowed?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
}

export interface PriceBreakdown {
  nightlyRates: { date: string; price: number; type: string }[];
  accommodationFee: number;
  extraGuestFee: number;
  cleaningFee: number;
  longStayDiscount: number;
  guestServiceFee: number;
  couponDiscount: number;
  totalPrice: number;
}
