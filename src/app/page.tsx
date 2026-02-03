import Link from 'next/link';
import { prisma } from '@/lib/prisma';

async function getFeaturedRegions() {
  try {
    return await prisma.featured_regions.findMany({
      where: { is_active: true },
      orderBy: { sort_order: 'asc' },
    });
  } catch {
    return [];
  }
}

async function getFeaturedAccommodations() {
  try {
    return await prisma.accommodations.findMany({
      where: { status: 'active' },
      include: {
        accommodation_photos: { take: 1, orderBy: { sort_order: 'asc' } },
        users_accommodations_host_idTousers: { select: { display_name: true, is_superhost: true } },
      },
      orderBy: { avg_rating: 'desc' },
      take: 8,
    });
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [regions, accommodations] = await Promise.all([
    getFeaturedRegions(),
    getFeaturedAccommodations(),
  ]);

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-rose-50 to-white py-16 md:py-24 px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">특별한 숙소를 찾아보세요</h1>
          <p className="text-gray-600 text-lg mb-8">한국의 다양한 숙소에서 잊지 못할 경험을</p>
          <div className="max-w-2xl mx-auto">
            <Link href="/search" className="block">
              <div className="flex items-center gap-3 bg-white rounded-full shadow-lg border px-6 py-4 hover:shadow-xl transition-shadow cursor-pointer">
                <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <span className="text-gray-400">어디로 여행가시나요?</span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Regions */}
      {regions.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-6">인기 지역</h2>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {regions.map((region) => (
              <Link
                key={region.id}
                href={`/search?keyword=${encodeURIComponent(region.search_keyword || region.region_name_ko)}`}
                className="flex-shrink-0 w-40 group"
              >
                <div className="aspect-square rounded-xl bg-gray-200 overflow-hidden mb-2">
                  {region.image_url ? (
                    <img src={region.image_url} alt={region.region_name_ko} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-2xl font-bold">
                      {region.region_name_ko[0]}
                    </div>
                  )}
                </div>
                <p className="font-medium text-center">{region.region_name_ko}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Category Tabs */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-6 overflow-x-auto border-b pb-3">
          {[
            { type: 'apartment', label: '아파트' },
            { type: 'hanok', label: '한옥' },
            { type: 'pension', label: '펜션' },
            { type: 'guesthouse', label: '게스트하우스' },
            { type: 'villa', label: '빌라' },
            { type: 'house', label: '단독주택' },
            { type: 'farmstay', label: '농가체험' },
          ].map((cat) => (
            <Link
              key={cat.type}
              href={`/search?type=${cat.type}`}
              className="flex-shrink-0 text-sm text-gray-600 hover:text-black pb-2 border-b-2 border-transparent hover:border-black transition-colors"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Recommended Accommodations */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">추천 숙소</h2>
        {accommodations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {accommodations.map((acc) => (
              <Link key={acc.id} href={`/accommodations/${acc.id}`} className="group">
                <div className="aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 mb-3">
                  {acc.accommodation_photos[0] ? (
                    <img
                      src={acc.accommodation_photos[0].url}
                      alt={acc.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                  )}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium truncate">{acc.name}</h3>
                    {acc.avg_rating > 0 && (
                      <span className="text-sm">★ {Number(acc.avg_rating).toFixed(1)}</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{acc.city}</p>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">₩{Number(acc.base_price).toLocaleString()}</span>
                    <span className="text-sm text-gray-500">/박</span>
                    {acc.users_accommodations_host_idTousers?.is_superhost && (
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">슈퍼호스트</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p className="text-lg mb-2">아직 등록된 숙소가 없습니다</p>
            <p className="text-sm">첫 번째 호스트가 되어보세요!</p>
          </div>
        )}
      </section>
    </div>
  );
}
