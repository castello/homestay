import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateRefundAmount } from '@/lib/payment';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const reservation = await prisma.reservations.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { guest_id: parseInt(session.user.id) },
          { accommodations: { host_id: parseInt(session.user.id) } },
        ],
      },
      include: {
        accommodations: {
          include: {
            accommodation_photos: { take: 3, orderBy: { sort_order: 'asc' } },
            users_accommodations_host_idTousers: { select: { id: true, display_name: true, profile_photo_url: true, phone: true } },
          },
        },
        users_reservations_guest_idTousers: { select: { id: true, display_name: true, profile_photo_url: true } },
        payments: true,
      },
    });

    if (!reservation) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ reservation });
  } catch (error) {
    console.error('Reservation fetch error:', error);
    return NextResponse.json({ error: '예약 정보를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const { action, cancelReason } = body;

    const reservation = await prisma.reservations.findFirst({
      where: { id: parseInt(id) },
      include: { accommodations: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: '예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    const isGuest = reservation.guest_id === parseInt(session.user.id);
    const isHost = reservation.accommodations.host_id === parseInt(session.user.id);

    if (!isGuest && !isHost) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    switch (action) {
      case 'cancel': {
        if (!['pending', 'confirmed'].includes(reservation.status)) {
          return NextResponse.json({ error: '취소할 수 없는 상태입니다.' }, { status: 400 });
        }

        const refundAmount = calculateRefundAmount(
          Number(reservation.total_price),
          reservation.accommodations.cancellation_policy || 'moderate',
          new Date(reservation.checkin_date)
        );

        const updated = await prisma.reservations.update({
          where: { id: parseInt(id) },
          data: {
            status: 'cancelled',
            cancelled_at: new Date(),
            cancellation_reason: cancelReason,
            cancelled_by: isGuest ? 'guest' : 'host',
            updated_at: new Date(),
          },
        });

        return NextResponse.json({ reservation: updated, refundAmount });
      }

      case 'confirm': {
        if (!isHost || reservation.status !== 'pending') {
          return NextResponse.json({ error: '승인할 수 없는 상태입니다.' }, { status: 400 });
        }

        const updated = await prisma.reservations.update({
          where: { id: parseInt(id) },
          data: { status: 'confirmed', updated_at: new Date() },
        });

        return NextResponse.json({ reservation: updated });
      }

      case 'reject': {
        if (!isHost || reservation.status !== 'pending') {
          return NextResponse.json({ error: '거절할 수 없는 상태입니다.' }, { status: 400 });
        }

        const updated = await prisma.reservations.update({
          where: { id: parseInt(id) },
          data: {
            status: 'cancelled',
            cancelled_at: new Date(),
            cancellation_reason: cancelReason || '호스트 거절',
            cancelled_by: 'host',
            updated_at: new Date(),
          },
        });

        return NextResponse.json({ reservation: updated });
      }

      case 'complete': {
        if (reservation.status !== 'confirmed') {
          return NextResponse.json({ error: '완료할 수 없는 상태입니다.' }, { status: 400 });
        }

        const updated = await prisma.reservations.update({
          where: { id: parseInt(id) },
          data: { status: 'completed', updated_at: new Date() },
        });

        return NextResponse.json({ reservation: updated });
      }

      default:
        return NextResponse.json({ error: '알 수 없는 액션입니다.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Reservation update error:', error);
    return NextResponse.json({ error: '예약 처리에 실패했습니다.' }, { status: 500 });
  }
}
