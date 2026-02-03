import { prisma } from './prisma';
import { eachDayOfInterval, isWeekend, parseISO, format } from 'date-fns';

interface PriceCalculation {
  nightlyRates: { date: string; price: number; type: string }[];
  accommodationFee: number;
  extraGuestFee: number;
  cleaningFee: number;
  longStayDiscount: number;
  guestServiceFee: number;
  hostServiceFee: number;
  totalPrice: number;
  hostPayout: number;
}

export async function calculatePrice(
  accommodationId: number,
  checkinDate: string,
  checkoutDate: string,
  adults: number,
  children: number = 0,
): Promise<PriceCalculation> {
  const accommodation = await prisma.accommodations.findUniqueOrThrow({
    where: { id: accommodationId },
    include: { long_stay_discounts: true },
  });

  const checkin = parseISO(checkinDate);
  const checkout = parseISO(checkoutDate);
  const dates = eachDayOfInterval({ start: checkin, end: new Date(checkout.getTime() - 86400000) });
  const nights = dates.length;
  const totalGuests = adults + children;
  const basePrice = Number(accommodation.base_price);
  const weekendPrice = accommodation.weekend_price ? Number(accommodation.weekend_price) : basePrice;
  const extraGuests = Math.max(0, totalGuests - (accommodation.base_guests || 2));

  const nightlyRates: { date: string; price: number; type: string }[] = [];

  for (const date of dates) {
    const dateStr = format(date, 'yyyy-MM-dd');
    let price = basePrice;
    let type = 'weekday';

    if (isWeekend(date)) {
      price = weekendPrice;
      type = 'weekend';
    }

    nightlyRates.push({ date: dateStr, price, type });
  }

  const accommodationFee = nightlyRates.reduce((sum, r) => sum + r.price, 0);
  const extraGuestFee = extraGuests * Number(accommodation.extra_guest_fee || 0) * nights;
  const cleaningFee = Number(accommodation.cleaning_fee || 0);

  let longStayDiscount = 0;
  if (accommodation.long_stay_discounts && accommodation.long_stay_discounts.length > 0) {
    const sortedDiscounts = [...accommodation.long_stay_discounts].sort((a, b) => b.min_nights - a.min_nights);
    const applicableDiscount = sortedDiscounts.find(d => nights >= d.min_nights);
    if (applicableDiscount) {
      longStayDiscount = Math.round(accommodationFee * Number(applicableDiscount.discount_rate) / 100);
    }
  }

  const subtotal = accommodationFee + extraGuestFee + cleaningFee - longStayDiscount;

  const guestFeeRate = 0.10;
  const hostFeeRate = 0.03;
  const guestServiceFee = Math.round(subtotal * guestFeeRate);
  const hostServiceFee = Math.round(subtotal * hostFeeRate);

  const totalPrice = subtotal + guestServiceFee;
  const hostPayout = subtotal - hostServiceFee;

  return {
    nightlyRates,
    accommodationFee,
    extraGuestFee,
    cleaningFee,
    longStayDiscount,
    guestServiceFee,
    hostServiceFee,
    totalPrice,
    hostPayout,
  };
}
