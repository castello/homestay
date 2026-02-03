import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const coupons = await prisma.coupons.findMany({
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Admin coupons error:', error);
    return NextResponse.json({ error: '쿠폰 목록을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();

    const existing = await prisma.coupons.findFirst({ where: { code: body.code } });
    if (existing) {
      return NextResponse.json({ error: '이미 존재하는 쿠폰 코드입니다.' }, { status: 409 });
    }

    const coupon = await prisma.coupons.create({
      data: {
        code: body.code,
        name: body.name,
        discount_type: body.discount_type,
        discount_value: body.discount_value,
        min_order_amount: body.min_order_amount || 0,
        max_discount: body.max_discount || null,
        total_quantity: body.total_quantity || null,
        valid_from: new Date(body.valid_from),
        valid_to: new Date(body.valid_to),
        is_active: true,
        updated_at: new Date(),
      },
    });

    return NextResponse.json({ coupon }, { status: 201 });
  } catch (error) {
    console.error('Coupon creation error:', error);
    return NextResponse.json({ error: '쿠폰 생성에 실패했습니다.' }, { status: 500 });
  }
}
