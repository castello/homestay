import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { generateOrderId } from '@/lib/payment';
import { createReservationSchema } from '@/lib/validators/reservation';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createReservationSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const data = validation.data;

    // 숙소 확인
    const accommodation = await prisma.accommodations.findUnique({
      where: { id: data.accommodationId },
      include: { users_accommodations_host_idTousers: true },
    });

    if (!accommodation) {
      return NextResponse.json({ error: '숙소를 찾을 수 없습니다.' }, { status: 404 });
    }

    if (accommodation.host_id === parseInt(session.user.id)) {
      return NextResponse.json({ error: '본인의 숙소는 예약할 수 없습니다.' }, { status: 400 });
    }

    // 날짜 가용성 확인
    const checkIn = new Date(data.checkInDate);
    const checkOut = new Date(data.checkOutDate);

    const conflicting = await prisma.reservations.findFirst({
      where: {
        accommodation_id: data.accommodationId,
        status: { in: ['pending', 'confirmed'] },
        OR: [
          { checkin_date: { lt: checkOut }, checkout_date: { gt: checkIn } },
        ],
      },
    });

    if (conflicting) {
      return NextResponse.json({ error: '선택한 날짜에 이미 예약이 있습니다.' }, { status: 409 });
    }

    // 차단된 날짜 확인
    const blocked = await prisma.availability_calendar.findFirst({
      where: {
        accommodation_id: data.accommodationId,
        date: { gte: checkIn, lt: checkOut },
        is_available: false,
      },
    });

    if (blocked) {
      return NextResponse.json({ error: '선택한 날짜 중 이용 불가한 날이 있습니다.' }, { status: 409 });
    }

    // 요금 계산
    const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const basePrice = Number(accommodation.base_price);
    const cleaningFee = Number(accommodation.cleaning_fee || 0);
    const accommodationTotal = basePrice * nights;
    const guestServiceFee = Math.floor(accommodationTotal * 0.1);
    const hostServiceFee = Math.floor(accommodationTotal * 0.03);
    const hostPayout = accommodationTotal + cleaningFee - hostServiceFee;
    const totalAmount = accommodationTotal + cleaningFee + guestServiceFee;

    // 쿠폰 할인
    let discountAmount = 0;
    let couponId: number | null = null;

    if (data.couponCode) {
      const coupon = await prisma.coupons.findFirst({
        where: {
          code: data.couponCode,
          is_active: true,
          valid_from: { lte: new Date() },
          valid_to: { gte: new Date() },
        },
      });

      if (coupon && (coupon.total_quantity === null || coupon.used_count < coupon.total_quantity)) {
        if (coupon.discount_type === 'percentage') {
          discountAmount = Math.floor(accommodationTotal * Number(coupon.discount_value) / 100);
          if (coupon.max_discount) {
            discountAmount = Math.min(discountAmount, Number(coupon.max_discount));
          }
        } else {
          discountAmount = Number(coupon.discount_value);
        }
        if (coupon.min_order_amount && totalAmount < Number(coupon.min_order_amount)) {
          discountAmount = 0;
        } else {
          couponId = coupon.id;
        }
      }
    }

    const finalAmount = totalAmount - discountAmount;
    const reservationNumber = generateOrderId();

    // 트랜잭션으로 예약 생성
    const reservation = await prisma.$transaction(async (tx) => {
      const newReservation = await tx.reservations.create({
        data: {
          reservation_number: reservationNumber,
          guest_id: parseInt(session.user.id),
          accommodation_id: data.accommodationId,
          host_id: accommodation.host_id,
          checkin_date: checkIn,
          checkout_date: checkOut,
          nights,
          adults: data.guests,
          children: 0,
          nightly_rate: basePrice,
          total_price: finalAmount,
          accommodation_fee: accommodationTotal,
          cleaning_fee: cleaningFee,
          guest_service_fee: guestServiceFee,
          host_service_fee: hostServiceFee,
          host_payout: hostPayout,
          coupon_discount: discountAmount,
          status: 'pending',
          guest_message: data.specialRequests || null,
          updated_at: new Date(),
        },
      });

      // 쿠폰 사용 처리
      if (couponId) {
        await tx.coupon_usages.create({
          data: {
            coupon_id: couponId,
            user_id: parseInt(session.user.id),
            reservation_id: newReservation.id,
            discount_amount: discountAmount,
          },
        });
        await tx.coupons.update({
          where: { id: couponId },
          data: { used_count: { increment: 1 } },
        });
      }

      return newReservation;
    });

    return NextResponse.json({
      reservation: {
        id: reservation.id,
        reservationNumber: reservation.reservation_number,
        totalAmount: finalAmount,
      },
    });
  } catch (error) {
    console.error('Reservation creation error:', error);
    return NextResponse.json({ error: '예약 생성에 실패했습니다.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where: Record<string, unknown> = {
      guest_id: parseInt(session.user.id),
    };

    if (status) {
      where.status = status;
    }

    const [reservations, total] = await Promise.all([
      prisma.reservations.findMany({
        where,
        include: {
          accommodations: {
            include: {
              accommodation_photos: { take: 1, orderBy: { sort_order: 'asc' } },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reservations.count({ where }),
    ]);

    return NextResponse.json({
      reservations,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Reservations fetch error:', error);
    return NextResponse.json({ error: '예약 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
