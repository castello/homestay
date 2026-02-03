import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const user = await prisma.users.findUnique({
      where: { id: parseInt(session.user.id) },
      select: {
        id: true,
        email: true,
        display_name: true,
        phone: true,
        profile_photo_url: true,
        bio: true,
        preferred_language: true,
        preferred_currency: true,
        role: true,
        is_host_approved: true,
        is_superhost: true,
        identity_verified: true,
        created_at: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: '사용자를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ error: '사용자 정보를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const allowedFields = ['display_name', 'phone', 'profile_photo_url', 'bio', 'preferred_language', 'preferred_currency'];
    const updateData: Record<string, unknown> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const user = await prisma.users.update({
      where: { id: parseInt(session.user.id) },
      data: updateData,
      select: {
        id: true,
        email: true,
        display_name: true,
        phone: true,
        profile_photo_url: true,
        bio: true,
        preferred_language: true,
        preferred_currency: true,
      },
    });

    return NextResponse.json({ user });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: '프로필 수정에 실패했습니다.' }, { status: 500 });
  }
}
