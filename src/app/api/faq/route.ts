import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const categories = await prisma.faq_categories.findMany({
      orderBy: { sort_order: 'asc' },
      include: {
        faqs: {
          where: { is_published: true },
          orderBy: { sort_order: 'asc' },
        },
      },
    });

    // Only return categories that have at least one published FAQ
    const filtered = categories.filter((cat) => cat.faqs.length > 0);

    return NextResponse.json({ categories: filtered });
  } catch (error) {
    console.error('FAQ fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}
