import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { AccommodationDetail } from '@/components/accommodation/accommodation-detail';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const acc = await prisma.accommodations.findUnique({
    where: { id: parseInt(id) },
    select: { name: true, description: true, city: true },
  });
  if (!acc) return { title: 'Not Found' };
  return {
    title: acc.name + ' - 홈스테이',
    description: acc.description?.slice(0, 160) || acc.city + '의 숙소',
  };
}

export default async function AccommodationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const accommodation = await prisma.accommodations.findUnique({
    where: { id: parseInt(id) },
    include: {
      users_accommodations_host_idTousers: {
        select: {
          id: true, display_name: true, profile_photo_url: true, is_superhost: true,
          created_at: true, identity_verified: true,
          host_profiles: { select: { response_rate: true, avg_response_time_minutes: true } },
        },
      },
      accommodation_photos: { orderBy: { sort_order: 'asc' } },
      rooms: { include: { beds: true }, orderBy: { sort_order: 'asc' } },
      accommodation_amenities: { include: { amenities: { include: { amenity_categories: true } } } },
      accommodation_tags: true,
      long_stay_discounts: { orderBy: { min_nights: 'asc' } },
      reviews: {
        where: { is_published: true, is_hidden: false, review_type: 'guest_to_host' },
        include: {
          users_reviews_reviewer_idTousers: { select: { display_name: true, profile_photo_url: true } },
          review_category_ratings: true,
          review_photos: true,
          review_replies: { include: { users: { select: { display_name: true } } } },
        },
        orderBy: { created_at: 'desc' },
        take: 6,
      },
    },
  });

  if (!accommodation || accommodation.status !== 'active') notFound();

  // Track view
  prisma.accommodation_views.create({
    data: { accommodation_id: parseInt(id), view_date: new Date() },
  }).catch(() => {});

  return <AccommodationDetail accommodation={accommodation} />;
}
