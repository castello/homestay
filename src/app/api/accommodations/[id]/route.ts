import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const accommodation = await prisma.accommodations.findUnique({
      where: { id: parseInt(id) },
      include: {
        users_accommodations_host_idTousers: {
          select: {
            id: true,
            display_name: true,
            profile_photo_url: true,
            is_superhost: true,
            created_at: true,
          },
        },
        accommodation_photos: { orderBy: { sort_order: 'asc' } },
        accommodation_amenities: {
          include: {
            amenities: {
              include: { amenity_categories: true },
            },
          },
        },
        reviews: {
          where: { review_type: 'guest_to_host', is_hidden: false },
          include: {
            users_reviews_reviewer_idTousers: {
              select: { display_name: true, profile_photo_url: true },
            },
            review_replies: {
              include: {
                users: { select: { display_name: true } },
              },
            },
          },
          orderBy: { created_at: 'desc' },
          take: 6,
        },
      },
    });

    if (!accommodation) {
      return NextResponse.json({ error: '숙소를 찾을 수 없습니다.' }, { status: 404 });
    }

    return NextResponse.json({ accommodation });
  } catch (error) {
    console.error('Accommodation fetch error:', error);
    return NextResponse.json({ error: '숙소 정보를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
