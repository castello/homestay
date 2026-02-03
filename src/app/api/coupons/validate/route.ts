import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const amount = parseInt(searchParams.get('amount') || '0');

    if (!code) {
      return NextResponse.json({ error: '쿠폰 코드를 입력하세요.' }, { status: 400 });
    }

    const coupon = await prisma.coupons.findFirst({
      where: {
        code,
        is_active: true,
        valid_from: { lte: new Date() },
        valid_to: { gte: new Date() },
      },
    });

    if (!coupon) {
      return NextResponse.json({ error: '유효하지 않은 쿠폰입니다.' }, { status: 404 });
    }

    if (coupon.total_quantity !== null && coupon.used_count >= coupon.total_quantity) {
      return NextResponse.json({ error: '사용 한도를 초과한 쿠폰입니다.' }, { status: 400 });
    }

    // 이미 사용했는지 확인
    const used = await prisma.coupon_usages.findFirst({
      where: {
        coupon_id: coupon.id,
        user_id: parseInt(session.user.id),
      },
    });

    if (used) {
      return NextResponse.json({ error: '이미 사용한 쿠폰입니다.' }, { status: 400 });
    }

    // 최소 주문 금액 확인
    if (coupon.min_order_amount && amount < Number(coupon.min_order_amount)) {
      return NextResponse.json({
        error: `최소 주문 금액 ${Number(coupon.min_order_amount).toLocaleString()}원 이상이어야 합니다.`,
      }, { status: 400 });
    }

    let discount: number;
    if (coupon.discount_type === 'percentage') {
      discount = Math.floor(amount * Number(coupon.discount_value) / 100);
      if (coupon.max_discount) {
        discount = Math.min(discount, Number(coupon.max_discount));
      }
    } else {
      discount = Number(coupon.discount_value);
    }

    return NextResponse.json({
      discount,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discount_type,
        discountValue: coupon.discount_value,
      },
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    return NextResponse.json({ error: '쿠폰 확인에 실패했습니다.' }, { status: 500 });
  }
}
