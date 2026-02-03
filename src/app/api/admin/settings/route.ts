import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'terms') {
      const terms = await prisma.terms_versions.findMany({
        orderBy: [{ type: 'asc' }, { version: 'desc' }],
      });
      return NextResponse.json({ terms });
    }

    const settings = await prisma.system_settings.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach(s => { settingsMap[s.setting_key] = s.setting_value; });

    return NextResponse.json({
      settings: {
        guestCommissionRate: parseInt(settingsMap.guest_commission_rate || '10'),
        hostCommissionRate: parseInt(settingsMap.host_commission_rate || '3'),
        defaultCancellationPolicy: settingsMap.default_cancellation_policy || 'moderate',
        maxImagesPerAccommodation: parseInt(settingsMap.max_images_per_accommodation || '20'),
        maxFileSizeMB: parseInt(settingsMap.max_file_size_mb || '10'),
        supportEmail: settingsMap.support_email || 'support@homestay.kr',
        supportPhone: settingsMap.support_phone || '02-1234-5678',
      },
    });
  } catch (error) {
    console.error('Admin settings error:', error);
    return NextResponse.json({ error: '설정을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const body = await request.json();

    const keyMap: Record<string, string> = {
      guestCommissionRate: 'guest_commission_rate',
      hostCommissionRate: 'host_commission_rate',
      defaultCancellationPolicy: 'default_cancellation_policy',
      maxImagesPerAccommodation: 'max_images_per_accommodation',
      maxFileSizeMB: 'max_file_size_mb',
      supportEmail: 'support_email',
      supportPhone: 'support_phone',
    };

    for (const [key, value] of Object.entries(body)) {
      const settingKey = keyMap[key];
      if (settingKey) {
        await prisma.system_settings.upsert({
          where: { setting_key: settingKey },
          update: { setting_value: String(value), updated_at: new Date() },
          create: { setting_key: settingKey, setting_value: String(value), updated_at: new Date() },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin settings update error:', error);
    return NextResponse.json({ error: '설정 저장에 실패했습니다.' }, { status: 500 });
  }
}
