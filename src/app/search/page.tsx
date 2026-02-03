'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAccommodations } from '@/hooks/use-accommodations';
import { AccommodationCard } from '@/components/accommodation/accommodation-card';
import { SearchBar } from '@/components/common/search-bar';
import { EmptyState } from '@/components/common/empty-state';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Search, Loader2, SlidersHorizontal } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { ACCOMMODATION_TYPES, SPACE_TYPES } from '@/lib/constants';

function SearchContent() {
  const searchParams = useSearchParams();
  const [sort, setSort] = useState('recommended');
  const [priceRange, setPriceRange] = useState([0, 500000]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    accommodationType: searchParams.getAll('accommodationType'),
    spaceType: searchParams.getAll('spaceType'),
    instantBooking: searchParams.get('instantBooking') === 'true',
    superhost: searchParams.get('superhost') === 'true',
    petAllowed: searchParams.get('petAllowed') === 'true',
  });

  const params = {
    keyword: searchParams.get('keyword') || '',
    checkin: searchParams.get('checkin') || '',
    checkout: searchParams.get('checkout') || '',
    adults: searchParams.get('adults') || '1',
    children: searchParams.get('children') || '0',
    sort,
    minPrice: priceRange[0] > 0 ? priceRange[0] : undefined,
    maxPrice: priceRange[1] < 500000 ? priceRange[1] : undefined,
    ...filters,
  };

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useAccommodations(params);
  const observerTarget = useRef<HTMLDivElement>(null);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const accommodations = data?.pages.flatMap((page: any) => page.accommodations) || [];
  const total = data?.pages[0]?.pagination?.total || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <SearchBar compact />
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">{total}개의 숙소</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal size={16} className="mr-1" /> 필터
          </Button>
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">추천순</SelectItem>
              <SelectItem value="price_asc">낮은 가격순</SelectItem>
              <SelectItem value="price_desc">높은 가격순</SelectItem>
              <SelectItem value="rating">평점순</SelectItem>
              <SelectItem value="reviews">리뷰 많은순</SelectItem>
              <SelectItem value="newest">최신순</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-4">
          <div>
            <h3 className="font-medium text-sm mb-2">가격 범위</h3>
            <Slider min={0} max={500000} step={10000} value={priceRange} onValueChange={setPriceRange} />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>₩{priceRange[0].toLocaleString()}</span>
              <span>₩{priceRange[1].toLocaleString()}</span>
            </div>
          </div>
          <div>
            <h3 className="font-medium text-sm mb-2">숙소 유형</h3>
            <div className="flex flex-wrap gap-2">
              {ACCOMMODATION_TYPES.map((type) => (
                <Label key={type.value} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <Checkbox
                    checked={filters.accommodationType.includes(type.value)}
                    onCheckedChange={(checked) => {
                      setFilters(prev => ({
                        ...prev,
                        accommodationType: checked
                          ? [...prev.accommodationType, type.value]
                          : prev.accommodationType.filter(t => t !== type.value),
                      }));
                    }}
                  />
                  {type.label}
                </Label>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <Label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <Checkbox checked={filters.instantBooking} onCheckedChange={(c) => setFilters(prev => ({ ...prev, instantBooking: c === true }))} />
              즉시 예약
            </Label>
            <Label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <Checkbox checked={filters.superhost} onCheckedChange={(c) => setFilters(prev => ({ ...prev, superhost: c === true }))} />
              슈퍼호스트
            </Label>
            <Label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <Checkbox checked={filters.petAllowed} onCheckedChange={(c) => setFilters(prev => ({ ...prev, petAllowed: c === true }))} />
              반려동물 가능
            </Label>
          </div>
        </div>
      )}

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin" size={32} />
        </div>
      ) : accommodations.length === 0 ? (
        <EmptyState icon={Search} title="검색 결과가 없습니다" description="다른 조건으로 검색해보세요" />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {accommodations.map((acc: any) => (
              <AccommodationCard key={acc.id} accommodation={acc} />
            ))}
          </div>
          <div ref={observerTarget} className="py-8 text-center">
            {isFetchingNextPage && <Loader2 className="animate-spin mx-auto" size={24} />}
          </div>
        </>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16 text-center"><Loader2 className="animate-spin mx-auto" size={32} /></div>}>
      <SearchContent />
    </Suspense>
  );
}
