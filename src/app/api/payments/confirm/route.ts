import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { confirmPayment } from '@/lib/payment';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { paymentKey, orderId, amount } = await request.json();

    if (!paymentKey || !orderId || !amount) {
      return NextResponse.json({ error: '필수 결제 정보가 없습니다.' }, { status: 400 });
    }

    // 예약 확인
    const reservation = await prisma.reservations.findFirst({
      where: {
        reservation_number: orderId,
        guest_id: parseInt(session.user.id),
        status: 'pending',
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    if (Number(reservation.total_price) !== amount) {
      return NextResponse.json({ error: '결제 금액이 일치하지 않습니다.' }, { status: 400 });
    }

    // 토스페이먼츠 결제 확인 (개발환경에서는 모의)
    let paymentResult;
    if (process.env.NODE_ENV === 'production') {
      paymentResult = await confirmPayment(paymentKey, orderId, amount);
    } else {
      paymentResult = {
        paymentKey,
        orderId,
        status: 'DONE',
        method: '카드',
        approvedAt: new Date().toISOString(),
      };
    }

    // 트랜잭션으로 결제 및 예약 상태 업데이트
    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payments.create({
        data: {
          reservation_id: reservation.id,
          user_id: parseInt(session.user.id),
          pg_transaction_id: paymentKey,
          amount: amount,
          payment_method: paymentResult.method || 'card',
          status: 'completed',
          paid_at: new Date(),
        },
      });

      const updatedReservation = await tx.reservations.update({
        where: { id: reservation.id },
        data: {
          status: 'confirmed',
          updated_at: new Date(),
        },
      });

      // 캘린더에 예약 날짜 차단
      const checkIn = new Date(reservation.checkin_date);
      const checkOut = new Date(reservation.checkout_date);
      const dates = [];
      const current = new Date(checkIn);
      while (current < checkOut) {
        dates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }

      for (const date of dates) {
        await tx.availability_calendar.create({
          data: {
            accommodation_id: reservation.accommodation_id,
            date: date,
            is_available: false,
            blocked_reason: 'reservation',
            reservation_id: reservation.id,
          },
        });
      }

      return { payment, reservation: updatedReservation };
    });

    return NextResponse.json({
      success: true,
      reservation: {
        id: result.reservation.id,
        reservationNumber: result.reservation.reservation_number,
        status: result.reservation.status,
      },
    });
  } catch (error) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json({ error: '결제 확인에 실패했습니다.' }, { status: 500 });
  }
}
