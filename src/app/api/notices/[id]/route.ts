import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const noticeId = parseInt(id);

    if (isNaN(noticeId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }

    const notice = await prisma.notices.findFirst({
      where: {
        id: noticeId,
        is_published: true,
      },
    });

    if (!notice) {
      return NextResponse.json({ error: 'Notice not found' }, { status: 404 });
    }

    // Increment view count
    await prisma.notices.update({
      where: { id: noticeId },
      data: { view_count: { increment: 1 } },
    });

    return NextResponse.json({ notice });
  } catch (error) {
    console.error('Notice fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notice' },
      { status: 500 }
    );
  }
}
