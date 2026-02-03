import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const folders = await prisma.wishlist_folders.findMany({
      where: { user_id: parseInt(session.user.id) },
      include: {
        wishlist_items: {
          include: {
            accommodations: {
              include: {
                accommodation_photos: { take: 1, orderBy: { sort_order: 'asc' } },
              },
            },
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ wishlists: folders });
  } catch (error) {
    console.error('Wishlists fetch error:', error);
    return NextResponse.json({ error: '위시리스트를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { accommodationId, folderId, name } = await request.json();
    const userId = parseInt(session.user.id);

    // 위시리스트 토글 (accommodationId가 있을 때)
    if (accommodationId) {
      let targetFolderId = folderId;

      if (!targetFolderId) {
        // 기본 위시리스트 가져오기/생성
        let defaultFolder = await prisma.wishlist_folders.findFirst({
          where: { user_id: userId, name: '기본 위시리스트' },
        });
        if (!defaultFolder) {
          defaultFolder = await prisma.wishlist_folders.create({
            data: { user_id: userId, name: '기본 위시리스트' },
          });
        }
        targetFolderId = defaultFolder.id;
      }

      const existing = await prisma.wishlist_items.findFirst({
        where: {
          folder_id: targetFolderId,
          accommodation_id: accommodationId,
        },
      });

      if (existing) {
        await prisma.wishlist_items.delete({ where: { id: existing.id } });
        return NextResponse.json({ action: 'removed' });
      } else {
        await prisma.wishlist_items.create({
          data: {
            folder_id: targetFolderId,
            accommodation_id: accommodationId,
          },
        });
        return NextResponse.json({ action: 'added' });
      }
    }

    // 새 위시리스트 생성
    if (name) {
      const folder = await prisma.wishlist_folders.create({
        data: { user_id: userId, name },
      });
      return NextResponse.json({ wishlist: folder }, { status: 201 });
    }

    return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  } catch (error) {
    console.error('Wishlist error:', error);
    return NextResponse.json({ error: '위시리스트 처리에 실패했습니다.' }, { status: 500 });
  }
}
