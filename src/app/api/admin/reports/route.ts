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

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') where.status = status;

    const reports = await prisma.reports.findMany({
      where,
      include: {
        users: { select: { display_name: true } },
        report_actions: true,
      },
      orderBy: { created_at: 'desc' },
      take: 50,
    });

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Admin reports error:', error);
    return NextResponse.json({ error: '신고 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
