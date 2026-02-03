import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { eachDayOfInterval, isWeekend, parseISO, format } from 'date-fns';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const checkin = searchParams.get('checkin');
    const checkout = searchParams.get('checkout');
    const adults = parseInt(searchParams.get('adults') || '1');
    const children = parseInt(searchParams.get('children') || '0');

    if (!checkin || !checkout) {
      return NextResponse.json({ error: 'checkin and checkout are required' }, { status: 400 });
    }

    const accommodation = await prisma.accommodations.findUnique({
      where: { id: parseInt(id) },
      include: { long_stay_discounts: true },
    });

    if (!accommodation) {
      return NextResponse.json({ error: '숙소를 찾을 수 없습니다.' }, { status: 404 });
    }

    const checkInDate = parseISO(checkin);
    const checkOutDate = parseISO(checkout);
    const dates = eachDayOfInterval({
      start: checkInDate,
      end: new Date(checkOutDate.getTime() - 86400000),
    });
    const nights = dates.length;
    const totalGuests = adults + children;
    const basePrice = Number(accommodation.base_price);
    const weekendPrice = accommodation.weekend_price ? Number(accommodation.weekend_price) : basePrice;

    const nightlyRates = dates.map((date) => {
      const price = isWeekend(date) ? weekendPrice : basePrice;
      return {
        date: format(date, 'yyyy-MM-dd'),
        price,
        type: isWeekend(date) ? 'weekend' : 'weekday',
      };
    });

    const accommodationFee = nightlyRates.reduce((sum, r) => sum + r.price, 0);
    const extraGuestFee = Math.max(0, totalGuests - (accommodation.base_guests || 2)) * Number(accommodation.extra_guest_fee || 0) * nights;
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
    const guestServiceFee = Math.round(subtotal * 0.1);
    const hostServiceFee = Math.round(subtotal * 0.03);
    const totalPrice = subtotal + guestServiceFee;
    const hostPayout = subtotal - hostServiceFee;

    return NextResponse.json({
      nightlyRates,
      accommodationFee,
      extraGuestFee,
      cleaningFee,
      longStayDiscount,
      guestServiceFee,
      hostServiceFee,
      totalPrice,
      hostPayout,
      nights,
    });
  } catch (error) {
    console.error('Price calculation error:', error);
    return NextResponse.json({ error: '가격 계산에 실패했습니다.' }, { status: 500 });
  }
}
