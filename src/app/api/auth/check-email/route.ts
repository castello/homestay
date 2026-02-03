import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: '이메일을 입력해주세요' }, { status: 400 });
  }
  const existing = await prisma.users.findUnique({ where: { email } });
  return NextResponse.json({ available: !existing });
}
