import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const keyword = searchParams.get('keyword') || '';
    const city = searchParams.get('city') || '';
    const type = searchParams.get('type') || '';
    const spaceType = searchParams.get('spaceType') || '';
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const guests = searchParams.get('guests');
    const bedrooms = searchParams.get('bedrooms');
    const bathrooms = searchParams.get('bathrooms');
    const superhost = searchParams.get('superhost');
    const instantBook = searchParams.get('instantBook');
    const amenities = searchParams.get('amenities');
    const sortBy = searchParams.get('sortBy') || 'recommended';
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');

    const where: Record<string, unknown> = {
      status: 'active',
    };

    if (keyword) {
      where.OR = [
        { name: { contains: keyword } },
        { description: { contains: keyword } },
        { address: { contains: keyword } },
        { city: { contains: keyword } },
      ];
    }
    if (city) where.city = { contains: city };
    if (type) where.accommodation_type = type;
    if (spaceType) where.space_type = spaceType;
    if (minPrice) where.base_price = { ...(where.base_price as Record<string, unknown> || {}), gte: parseInt(minPrice) };
    if (maxPrice) where.base_price = { ...(where.base_price as Record<string, unknown> || {}), lte: parseInt(maxPrice) };
    if (guests) where.max_guests = { gte: parseInt(guests) };
    if (bedrooms) where.bedrooms = { gte: parseInt(bedrooms) };
    if (bathrooms) where.bathrooms = { gte: parseInt(bathrooms) };
    if (superhost === 'true') where.users_accommodations_host_idTousers = { is_superhost: true };
    if (instantBook === 'true') where.instant_booking = true;

    let orderBy: Record<string, string> = { created_at: 'desc' };
    switch (sortBy) {
      case 'price_asc': orderBy = { base_price: 'asc' }; break;
      case 'price_desc': orderBy = { base_price: 'desc' }; break;
      case 'rating': orderBy = { avg_rating: 'desc' }; break;
      case 'reviews': orderBy = { review_count: 'desc' }; break;
      case 'newest': orderBy = { created_at: 'desc' }; break;
      default: orderBy = { avg_rating: 'desc' }; break;
    }

    const [accommodations, total] = await Promise.all([
      prisma.accommodations.findMany({
        where,
        include: {
          accommodation_photos: { take: 5, orderBy: { sort_order: 'asc' } },
          users_accommodations_host_idTousers: { select: { id: true, display_name: true, profile_photo_url: true, is_superhost: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.accommodations.count({ where }),
    ]);

    // 날짜 가용성 필터 (post-query)
    let filtered = accommodations;
    if (checkIn && checkOut) {
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);

      const bookedIds = await prisma.reservations.findMany({
        where: {
          accommodation_id: { in: accommodations.map(a => a.id) },
          status: { in: ['pending', 'confirmed'] },
          OR: [
            { checkin_date: { lt: checkOutDate }, checkout_date: { gt: checkInDate } },
          ],
        },
        select: { accommodation_id: true },
      });

      const bookedSet = new Set(bookedIds.map(b => b.accommodation_id));
      filtered = accommodations.filter(a => !bookedSet.has(a.id));
    }

    return NextResponse.json({
      accommodations: filtered,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error('Accommodations search error:', error);
    return NextResponse.json({ error: '숙소 검색에 실패했습니다.' }, { status: 500 });
  }
}
