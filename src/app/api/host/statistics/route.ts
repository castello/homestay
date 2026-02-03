import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    const since = new Date();
    since.setDate(since.getDate() - days);

    const hostId = parseInt(session.user.id);

    const properties = await prisma.accommodations.findMany({
      where: { host_id: hostId },
      select: { id: true, name: true, booking_count: true },
    });

    const propertyIds = properties.map(p => p.id);

    const reservations = await prisma.reservations.findMany({
      where: {
        accommodation_id: { in: propertyIds },
        created_at: { gte: since },
        status: { in: ['confirmed', 'completed'] },
      },
      select: { accommodation_id: true, total_price: true },
    });

    const totalViews = properties.reduce((sum, p) => sum + (p.booking_count || 0), 0);
    const totalBookings = reservations.length;
    const totalRevenue = reservations.reduce((sum, r) => sum + Number(r.total_price), 0);

    const avgRating = await prisma.reviews.aggregate({
      where: { accommodation_id: { in: propertyIds } },
      _avg: { overall_rating: true },
    });

    const propertyStats = properties.map(p => {
      const propReservations = reservations.filter(r => r.accommodation_id === p.id);
      return {
        id: p.id,
        name: p.name,
        views: p.booking_count || 0,
        bookings: propReservations.length,
        revenue: propReservations.reduce((sum, r) => sum + Number(r.total_price), 0),
      };
    });

    return NextResponse.json({
      stats: {
        totalViews,
        totalBookings,
        totalRevenue,
        averageRating: avgRating._avg.overall_rating || 0,
        occupancyRate: 0,
        monthlyRevenue: [],
        propertyStats,
      },
    });
  } catch (error) {
    console.error('Host statistics error:', error);
    return NextResponse.json({ error: '통계를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
