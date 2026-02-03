import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const properties = await prisma.accommodations.findMany({
      where: { host_id: parseInt(session.user.id) },
      include: {
        accommodation_photos: { take: 1, orderBy: { sort_order: 'asc' } },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ properties });
  } catch (error) {
    console.error('Host properties fetch error:', error);
    return NextResponse.json({ error: '숙소 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const body = await request.json();

    const accommodation = await prisma.accommodations.create({
      data: {
        host_id: parseInt(session.user.id),
        name: body.name,
        description: body.description,
        accommodation_type: body.accommodation_type,
        space_type: body.space_type || 'entire',
        max_guests: body.max_guests || 2,
        base_guests: body.base_guests || body.max_guests || 2,
        bedrooms: body.bedrooms || 1,
        bathrooms: body.bathrooms || 1,
        address: body.address,
        address_detail: body.address_detail || null,
        city: body.city,
        province: body.province || null,
        postal_code: body.postal_code || null,
        latitude: body.latitude || 37.5665,
        longitude: body.longitude || 126.978,
        base_price: body.base_price || 50000,
        weekend_price: body.weekend_price || null,
        cleaning_fee: body.cleaning_fee || 0,
        extra_guest_fee: body.extra_guest_fee || 0,
        checkin_time: body.checkin_time || '15:00',
        checkout_time: body.checkout_time || '11:00',
        min_nights: body.min_nights || 1,
        max_nights: body.max_nights || 365,
        pet_allowed: body.pet_allowed || false,
        cancellation_policy: body.cancellation_policy || 'moderate',
        house_rules: body.house_rules || null,
        status: 'pending',
        updated_at: new Date(),
      },
    });

    // 호스트 플래그 업데이트
    await prisma.users.update({
      where: { id: parseInt(session.user.id) },
      data: { is_host_approved: true, updated_at: new Date() },
    });

    return NextResponse.json({ accommodation }, { status: 201 });
  } catch (error) {
    console.error('Property creation error:', error);
    return NextResponse.json({ error: '숙소 등록에 실패했습니다.' }, { status: 500 });
  }
}
