import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const settlements = await prisma.settlements.findMany({
      include: {
        users: { select: { display_name: true } },
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    return NextResponse.json({ settlements });
  } catch (error) {
    console.error('Admin settlements error:', error);
    return NextResponse.json({ error: '정산 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
