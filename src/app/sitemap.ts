import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/signup`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];

  try {
    const accommodations = await prisma.accommodations.findMany({
      where: { status: 'active' },
      select: { id: true, updated_at: true },
      orderBy: { updated_at: 'desc' },
      take: 5000,
    });

    const accommodationRoutes: MetadataRoute.Sitemap = accommodations.map((acc) => ({
      url: `${baseUrl}/accommodations/${acc.id}`,
      lastModified: acc.updated_at,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }));

    return [...staticRoutes, ...accommodationRoutes];
  } catch {
    return staticRoutes;
  }
}
