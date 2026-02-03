import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const settlements = await prisma.settlements.findMany({
      where: { host_id: parseInt(session.user.id) },
      orderBy: { created_at: 'desc' },
    });

    const totalRevenue = settlements.reduce((sum, s) => sum + Number(s.gross_amount), 0);
    const totalCommission = settlements.reduce((sum, s) => sum + Number(s.commission_amount), 0);
    const totalNet = settlements.reduce((sum, s) => sum + Number(s.net_amount), 0);
    const pendingAmount = settlements.filter(s => s.status === 'pending').reduce((sum, s) => sum + Number(s.net_amount), 0);

    return NextResponse.json({
      settlements,
      summary: { totalRevenue, totalCommission, totalNet, pendingAmount },
    });
  } catch (error) {
    console.error('Host settlements error:', error);
    return NextResponse.json({ error: '정산 내역을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
