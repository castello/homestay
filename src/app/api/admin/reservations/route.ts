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
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') where.status = status;
    if (search) where.reservation_number = { contains: search };

    const reservations = await prisma.reservations.findMany({
      where,
      include: {
        users_reservations_guest_idTousers: { select: { display_name: true, email: true } },
        accommodations: {
          select: { name: true, users_accommodations_host_idTousers: { select: { display_name: true } } },
        },
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error('Admin reservations error:', error);
    return NextResponse.json({ error: '예약 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
