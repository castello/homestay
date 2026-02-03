'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { RatingDisplay } from '@/components/common/rating-display';
import { StarRating } from '@/components/common/star-rating';
import { BookingWidget } from '@/components/accommodation/booking-widget';
import { Share2, Heart, Award, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export function AccommodationDetail({ accommodation }: { accommodation: any }) {
  const [currentPhoto, setCurrentPhoto] = useState(0);
  const photos = accommodation.accommodation_photos || [];
  const host = accommodation.users_accommodations_host_idTousers;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Title */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold">{accommodation.name}</h1>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2 text-sm">
            <RatingDisplay rating={accommodation.avg_rating} reviewCount={accommodation.review_count} />
            <span className="text-gray-400">·</span>
            <span className="text-gray-600">{accommodation.city}, {accommodation.province}</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm"><Share2 size={16} className="mr-1" /> 공유</Button>
            <Button variant="ghost" size="sm"><Heart size={16} className="mr-1" /> 저장</Button>
          </div>
        </div>
      </div>

      {/* Photo Gallery */}
      {photos.length > 0 && (
        <div className="relative aspect-[16/9] md:aspect-[2/1] rounded-xl overflow-hidden mb-8">
          <img src={photos[currentPhoto]?.url} alt="" className="w-full h-full object-cover" />
          {photos.length > 1 && (
            <>
              <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow" onClick={() => setCurrentPhoto(p => p > 0 ? p - 1 : photos.length - 1)}>
                <ChevronLeft size={20} />
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow" onClick={() => setCurrentPhoto(p => p < photos.length - 1 ? p + 1 : 0)}>
                <ChevronRight size={20} />
              </button>
              <div className="absolute bottom-4 right-4 bg-black/70 text-white text-sm px-3 py-1 rounded-full">
                {currentPhoto + 1} / {photos.length}
              </div>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Host Info */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{host?.display_name}님이 호스팅하는 숙소</h2>
              <p className="text-gray-600 text-sm mt-1">
                최대 {accommodation.max_guests}명 · 침실 {accommodation.bedrooms}개 · 침대 {accommodation.beds}개 · 욕실 {accommodation.bathrooms}개
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
              {host?.profile_photo_url ? (
                <img src={host.profile_photo_url} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <Users size={20} className="text-gray-400" />
              )}
            </div>
          </div>

          {host?.is_superhost && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Award className="text-rose-500" />
              <div>
                <p className="font-medium">슈퍼호스트</p>
                <p className="text-sm text-gray-500">경험이 풍부하고 높은 평점의 호스트입니다</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold mb-3">숙소 설명</h3>
            <p className="text-gray-700 whitespace-pre-line">{accommodation.description || '설명이 없습니다.'}</p>
          </div>

          <Separator />

          {/* Amenities */}
          {accommodation.accommodation_amenities?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3">편의시설</h3>
              <div className="grid grid-cols-2 gap-3">
                {accommodation.accommodation_amenities.map((aa: any) => (
                  <div key={aa.amenities.id} className="flex items-center gap-2 text-sm">
                    <span>{aa.amenities.icon || '✓'}</span>
                    <span>{aa.amenities.display_name_ko}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* House Rules */}
          <div>
            <h3 className="text-lg font-semibold mb-3">하우스 룰</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>체크인: {accommodation.checkin_time || '15:00'}</p>
              <p>체크아웃: {accommodation.checkout_time || '11:00'}</p>
              {accommodation.pet_allowed === false && <p>반려동물 불가</p>}
            </div>
          </div>

          <Separator />

          {/* Reviews */}
          {accommodation.reviews?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                <RatingDisplay rating={accommodation.avg_rating} reviewCount={accommodation.review_count} size="lg" />
              </h3>
              <div className="space-y-6">
                {accommodation.reviews.map((review: any) => (
                  <div key={review.id}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {review.users_reviews_reviewer_idTousers?.profile_photo_url ? (
                          <img src={review.users_reviews_reviewer_idTousers.profile_photo_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <Users size={16} className="text-gray-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{review.users_reviews_reviewer_idTousers?.display_name}</p>
                        <p className="text-xs text-gray-500">{format(new Date(review.created_at), 'yyyy년 M월', { locale: ko })}</p>
                      </div>
                    </div>
                    <StarRating value={review.overall_rating} readonly size={14} />
                    <p className="text-sm text-gray-700 mt-2">{review.content}</p>
                    {review.review_replies && (
                      <div className="mt-3 ml-4 p-3 bg-gray-50 rounded-lg text-sm">
                        <p className="font-medium">{review.review_replies.users?.display_name}님의 답변</p>
                        <p className="text-gray-700 mt-1">{review.review_replies.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Booking Widget */}
        <div>
          <BookingWidget accommodation={accommodation} />
        </div>
      </div>
    </div>
  );
}
