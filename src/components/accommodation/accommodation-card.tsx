'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { RatingDisplay } from '@/components/common/rating-display';
import { PriceDisplay } from '@/components/common/price-display';
import { cn } from '@/lib/utils';

interface AccommodationCardProps {
  accommodation: any;
}

export function AccommodationCard({ accommodation }: AccommodationCardProps) {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const [isWished, setIsWished] = useState(false);
  const photos = accommodation.accommodation_photos || [];
  const host = accommodation.users_accommodations_host_idTousers;

  return (
    <div className="group">
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-200 mb-3">
        {photos.length > 0 ? (
          <img
            src={photos[currentPhoto]?.url}
            alt={accommodation.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}

        {/* Wishlist button */}
        <button
          className="absolute top-3 right-3 z-10"
          onClick={(e) => { e.preventDefault(); setIsWished(!isWished); }}
        >
          <Heart size={22} className={cn('drop-shadow', isWished ? 'fill-rose-500 text-rose-500' : 'text-white fill-black/30')} />
        </button>

        {/* Superhost badge */}
        {host?.is_superhost && (
          <span className="absolute top-3 left-3 bg-white text-xs font-medium px-2 py-1 rounded-full shadow">슈퍼호스트</span>
        )}

        {/* Photo navigation */}
        {photos.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.preventDefault(); setCurrentPhoto((p) => (p > 0 ? p - 1 : photos.length - 1)); }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => { e.preventDefault(); setCurrentPhoto((p) => (p < photos.length - 1 ? p + 1 : 0)); }}
            >
              <ChevronRight size={16} />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.slice(0, 5).map((_: any, i: number) => (
                <div key={i} className={cn('w-1.5 h-1.5 rounded-full', i === currentPhoto ? 'bg-white' : 'bg-white/50')} />
              ))}
            </div>
          </>
        )}
      </div>

      <Link href={`/accommodations/${accommodation.id}`}>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <h3 className="font-medium truncate">{accommodation.name}</h3>
            <RatingDisplay rating={accommodation.avg_rating} reviewCount={accommodation.review_count} size="sm" />
          </div>
          <p className="text-sm text-gray-500">{accommodation.city || accommodation.province}</p>
          <PriceDisplay amount={accommodation.base_price} className="font-semibold" showPerNight />
        </div>
      </Link>
    </div>
  );
}
