import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
    const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const prevMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);

    const [
      totalUsers,
      newUsersThisMonth,
      totalAccommodations,
      pendingAccommodations,
      monthlyReservations,
      prevMonthReservations,
      monthlyRevenue,
      prevMonthRevenue,
      pendingReports,
      pendingSettlements,
      recentUsers,
      recentReservations,
    ] = await Promise.all([
      prisma.users.count({ where: { status: 'active' } }),
      prisma.users.count({ where: { created_at: { gte: monthStart, lte: monthEnd } } }),
      prisma.accommodations.count({ where: { status: 'active' } }),
      prisma.accommodations.count({ where: { status: 'pending' } }),
      prisma.reservations.count({ where: { created_at: { gte: monthStart, lte: monthEnd } } }),
      prisma.reservations.count({ where: { created_at: { gte: prevMonthStart, lte: prevMonthEnd } } }),
      prisma.reservations.aggregate({
        where: { status: { in: ['confirmed', 'completed'] }, created_at: { gte: monthStart, lte: monthEnd } },
        _sum: { total_price: true },
      }),
      prisma.reservations.aggregate({
        where: { status: { in: ['confirmed', 'completed'] }, created_at: { gte: prevMonthStart, lte: prevMonthEnd } },
        _sum: { total_price: true },
      }),
      prisma.reports.count({ where: { status: 'pending' } }),
      prisma.settlements.count({ where: { status: 'pending' } }),
      prisma.users.findMany({
        select: { id: true, display_name: true, email: true, role: true, created_at: true },
        orderBy: { created_at: 'desc' },
        take: 5,
      }),
      prisma.reservations.findMany({
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
        totalUsers,
        newUsersThisMonth,
        totalAccommodations,
        pendingAccommodations,
        monthlyReservations,
        prevMonthReservations,
        monthlyRevenue: Number(monthlyRevenue._sum.total_price || 0),
        prevMonthRevenue: Number(prevMonthRevenue._sum.total_price || 0),
        pendingReports,
        pendingSettlements,
      },
      recentUsers,
      recentReservations,
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: '대시보드 데이터를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
