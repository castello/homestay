import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const reservations = await prisma.reservations.findMany({
      where: {
        accommodations: { host_id: parseInt(session.user.id) },
      },
      include: {
        users_reservations_guest_idTousers: { select: { id: true, display_name: true, profile_photo_url: true } },
        accommodations: { select: { id: true, name: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error('Host reservations fetch error:', error);
    return NextResponse.json({ error: '예약 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
