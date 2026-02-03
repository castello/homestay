import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const [notices, total] = await Promise.all([
      prisma.notices.findMany({
        where: { is_published: true },
        orderBy: [
          { is_pinned: 'desc' },
          { created_at: 'desc' },
        ],
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          content: true,
          is_pinned: true,
          view_count: true,
          created_at: true,
        },
      }),
      prisma.notices.count({ where: { is_published: true } }),
    ]);

    return NextResponse.json({
      notices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Notices fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notices' },
      { status: 500 }
    );
  }
}
