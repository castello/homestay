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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role');

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { display_name: { contains: search } },
        { email: { contains: search } },
      ];
    }
    if (role && role !== 'all') {
      where.role = role;
    }

    const [users, total] = await Promise.all([
      prisma.users.findMany({
        where,
        select: {
          id: true, email: true, display_name: true, role: true, status: true,
          is_host_approved: true, is_superhost: true, identity_verified: true, created_at: true,
          _count: { select: { reservations_reservations_guest_idTousers: true } },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.users.count({ where }),
    ]);

    return NextResponse.json({ users, total });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ error: '회원 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
