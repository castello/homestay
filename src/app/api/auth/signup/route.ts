import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signupSchema } from '@/lib/validators/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const data = signupSchema.parse(body);

    const existing = await prisma.users.findUnique({
      where: { email: data.email },
    });
    if (existing) {
      return NextResponse.json({ error: '이미 등록된 이메일입니다' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.users.create({
      data: {
        email: data.email,
        password_hash: passwordHash,
        display_name: data.displayName,
        phone: data.phone || null,
        terms_agreed_at: new Date(),
        privacy_agreed_at: new Date(),
        marketing_consent: data.marketingConsent || false,
      },
    });

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
      return NextResponse.json({ error: (error as unknown as { errors: unknown }).errors }, { status: 400 });
    }
    return NextResponse.json({ error: '회원가입에 실패했습니다' }, { status: 500 });
  }
}
