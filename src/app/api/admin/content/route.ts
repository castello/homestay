import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'notices';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (type === 'notices') {
      const [notices, total] = await Promise.all([
        prisma.notices.findMany({
          orderBy: { created_at: 'desc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.notices.count(),
      ]);
      return NextResponse.json({ items: notices, total, page, limit });
    }

    if (type === 'faq') {
      const [faqs, total] = await Promise.all([
        prisma.faqs.findMany({
          include: { faq_categories: true },
          orderBy: { sort_order: 'asc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.faqs.count(),
      ]);
      return NextResponse.json({ items: faqs, total, page, limit });
    }

    if (type === 'banners') {
      const [banners, total] = await Promise.all([
        prisma.banners.findMany({
          orderBy: { sort_order: 'asc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.banners.count(),
      ]);
      return NextResponse.json({ items: banners, total, page, limit });
    }

    if (type === 'featured_regions') {
      const [regions, total] = await Promise.all([
        prisma.featured_regions.findMany({
          orderBy: { sort_order: 'asc' },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.featured_regions.count(),
      ]);
      return NextResponse.json({ items: regions, total, page, limit });
    }

    return NextResponse.json({ error: '유효하지 않은 콘텐츠 타입입니다.' }, { status: 400 });
  } catch (error) {
    console.error('Content fetch error:', error);
    return NextResponse.json({ error: '콘텐츠를 불러오는데 실패했습니다.' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'admin') {
      return NextResponse.json({ error: '관리자 권한이 필요합니다.' }, { status: 403 });
    }

    const body = await request.json();
    const { type, ...data } = body;

    if (type === 'notices') {
      const notice = await prisma.notices.create({
        data: {
          title: data.title,
          content: data.content,
          is_published: data.is_published ?? true,
          is_pinned: data.is_pinned || false,
          published_at: data.is_published ? new Date() : null,
          author_id: parseInt(session.user.id),
          updated_at: new Date(),
        },
      });
      return NextResponse.json({ item: notice });
    }

    if (type === 'faq') {
      const faq = await prisma.faqs.create({
        data: {
          category_id: data.category_id,
          question: data.question,
          answer: data.answer,
          sort_order: data.sort_order || 0,
          is_published: data.is_published ?? true,
          updated_at: new Date(),
        },
      });
      return NextResponse.json({ item: faq });
    }

    if (type === 'banners') {
      const banner = await prisma.banners.create({
        data: {
          title: data.title,
          image_url: data.image_url,
          link_url: data.link_url || null,
          position: data.position || 'main_top',
          sort_order: data.sort_order || 0,
          is_active: data.is_active ?? true,
          start_date: data.start_date ? new Date(data.start_date) : null,
          end_date: data.end_date ? new Date(data.end_date) : null,
          updated_at: new Date(),
        },
      });
      return NextResponse.json({ item: banner });
    }

    return NextResponse.json({ error: '유효하지 않은 콘텐츠 타입입니다.' }, { status: 400 });
  } catch (error) {
    console.error('Content creation error:', error);
    return NextResponse.json({ error: '콘텐츠 생성에 실패했습니다.' }, { status: 500 });
  }
}
