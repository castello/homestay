import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const hostId = parseInt(session.user.id);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);

    const [
      todayCheckins,
      todayCheckouts,
      pendingReservations,
      monthlyRevenue,
      totalProperties,
      activeProperties,
      avgRating,
      unreadMessages,
      recentReservations,
    ] = await Promise.all([
      prisma.reservations.count({
        where: { host_id: hostId, status: 'confirmed', checkin_date: { gte: today, lt: tomorrow } },
      }),
      prisma.reservations.count({
        where: { host_id: hostId, status: { in: ['confirmed', 'checked_in'] }, checkout_date: { gte: today, lt: tomorrow } },
      }),
      prisma.reservations.count({
        where: { host_id: hostId, status: 'pending' },
      }),
      prisma.reservations.aggregate({
        where: {
          host_id: hostId,
          status: { in: ['confirmed', 'completed'] },
          created_at: { gte: monthStart, lte: monthEnd },
        },
        _sum: { host_payout: true },
      }),
      prisma.accommodations.count({ where: { host_id: hostId } }),
      prisma.accommodations.count({ where: { host_id: hostId, status: 'active' } }),
      prisma.accommodations.aggregate({
        where: { host_id: hostId, status: 'active' },
        _avg: { avg_rating: true },
      }),
      prisma.messages.count({
        where: {
          conversation_rooms: { host_id: hostId },
          sender_id: { not: hostId },
          is_read: false,
        },
      }),
      prisma.reservations.findMany({
        where: { host_id: hostId },
        include: {
          users_reservations_guest_idTousers: { select: { display_name: true } },
          accommodations: { select: { name: true } },
        },
        orderBy: { created_at: 'desc' },
        take: 5,
      }),
    ]);

    return NextResponse.json({
      stats: {
        todayCheckins,
        todayCheckouts,
        pendingReservations,
        monthlyRevenue: Number(monthlyRevenue._sum.host_payout || 0),
        totalProperties,
        activeProperties,
        avgRating: avgRating._avg.avg_rating ? Number(avgRating._avg.avg_rating).toFixed(1) : '-',
        unreadMessages,
      },
      recentReservations,
    });
  } catch (error) {
    console.error('Host dashboard error:', error);
    return NextResponse.json({ error: '대시보드 데이터를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
