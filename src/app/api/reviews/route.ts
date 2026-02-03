import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { createReviewSchema } from '@/lib/validators/review';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createReviewSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.issues[0].message }, { status: 400 });
    }

    const data = validation.data;

    const reservation = await prisma.reservations.findFirst({
      where: {
        id: data.reservationId,
        guest_id: parseInt(session.user.id),
        status: 'completed',
      },
      include: { accommodations: true },
    });

    if (!reservation) {
      return NextResponse.json({ error: '완료된 예약을 찾을 수 없습니다.' }, { status: 404 });
    }

    const existing = await prisma.reviews.findFirst({
      where: {
        reservation_id: data.reservationId,
        reviewer_id: parseInt(session.user.id),
      },
    });

    if (existing) {
      return NextResponse.json({ error: '이미 리뷰를 작성했습니다.' }, { status: 409 });
    }

    const categoryRatings: { category: string; rating: number }[] = [];
    if (data.cleanlinessRating) categoryRatings.push({ category: 'cleanliness', rating: data.cleanlinessRating });
    if (data.accuracyRating) categoryRatings.push({ category: 'accuracy', rating: data.accuracyRating });
    if (data.communicationRating) categoryRatings.push({ category: 'communication', rating: data.communicationRating });
    if (data.locationRating) categoryRatings.push({ category: 'location', rating: data.locationRating });
    if (data.checkinRating) categoryRatings.push({ category: 'checkin', rating: data.checkinRating });
    if (data.valueRating) categoryRatings.push({ category: 'value', rating: data.valueRating });

    const review = await prisma.reviews.create({
      data: {
        reservation_id: data.reservationId,
        accommodation_id: reservation.accommodation_id,
        reviewer_id: parseInt(session.user.id),
        reviewee_id: reservation.accommodations.host_id,
        overall_rating: data.overallRating,
        content: data.content,
        private_feedback: data.privateFeedback || null,
        review_type: 'guest_to_host',
        review_category_ratings: {
          create: categoryRatings,
        },
      },
    });

    // 숙소 평균 평점 업데이트
    const stats = await prisma.reviews.aggregate({
      where: {
        accommodation_id: reservation.accommodation_id,
        review_type: 'guest_to_host',
      },
      _avg: { overall_rating: true },
      _count: true,
    });

    await prisma.accommodations.update({
      where: { id: reservation.accommodation_id },
      data: {
        avg_rating: stats._avg.overall_rating || 0,
        review_count: stats._count,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error('Review creation error:', error);
    return NextResponse.json({ error: '리뷰 작성에 실패했습니다.' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accommodationId = searchParams.get('accommodationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!accommodationId) {
      return NextResponse.json({ error: 'accommodationId가 필요합니다.' }, { status: 400 });
    }

    const where = {
      accommodation_id: parseInt(accommodationId),
      review_type: 'guest_to_host' as const,
      is_hidden: false,
    };

    const [reviews, total] = await Promise.all([
      prisma.reviews.findMany({
        where,
        include: {
          users_reviews_reviewer_idTousers: {
            select: { id: true, display_name: true, profile_photo_url: true },
          },
          review_replies: {
            include: {
              users: { select: { id: true, display_name: true } },
            },
          },
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reviews.count({ where }),
    ]);

    return NextResponse.json({
      reviews,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Reviews fetch error:', error);
    return NextResponse.json({ error: '리뷰를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
