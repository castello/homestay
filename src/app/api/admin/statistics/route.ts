import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const since = new Date();
    since.setDate(since.getDate() - days);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [totalUsers, totalAccommodations, totalReservations, revenueResult, newUsersThisMonth, newReservationsThisMonth] = await Promise.all([
      prisma.users.count(),
      prisma.accommodations.count(),
      prisma.reservations.count(),
      prisma.reservations.aggregate({
        where: { status: { in: ['confirmed', 'completed'] } },
        _sum: { total_price: true },
      }),
      prisma.users.count({ where: { created_at: { gte: startOfMonth } } }),
      prisma.reservations.count({ where: { created_at: { gte: startOfMonth } } }),
    ]);

    // Top accommodations
    const accommodations = await prisma.accommodations.findMany({
      select: {
        id: true, name: true,
        _count: { select: { reservations: true } },
      },
      orderBy: { reservations: { _count: 'desc' } },
      take: 10,
    });

    const topAccommodations = await Promise.all(
      accommodations.map(async (acc) => {
        const revenue = await prisma.reservations.aggregate({
          where: { accommodation_id: acc.id, status: { in: ['confirmed', 'completed'] } },
          _sum: { total_price: true },
        });
        return {
          id: acc.id,
          name: acc.name,
          bookings: acc._count.reservations,
          revenue: Number(revenue._sum.total_price || 0),
        };
      })
    );

    return NextResponse.json({
      stats: {
        totalUsers,
        totalAccommodations,
        totalReservations,
        totalRevenue: Number(revenueResult._sum.total_price || 0),
        newUsersThisMonth,
        newReservationsThisMonth,
        topAccommodations,
      },
    });
  } catch (error) {
    console.error('Admin statistics error:', error);
    return NextResponse.json({ error: '통계를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
