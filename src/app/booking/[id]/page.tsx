'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useSearchStore } from '@/stores/search-store';

interface Accommodation {
  id: number;
  name: string;
  address: string;
  base_price: number;
  cleaning_fee: number;
  accommodation_photos: { url: string }[];
  avg_rating: number;
  review_count: number;
  cancellation_policy: string;
  users_accommodations_host_idTousers: { display_name: string };
}

export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const { checkin, checkout, adults, children } = useSearchStore();
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [agreed, setAgreed] = useState(false);

  const checkIn = checkin ? new Date(checkin) : null;
  const checkOut = checkout ? new Date(checkout) : null;
  const nights = checkIn && checkOut ? differenceInDays(checkOut, checkIn) : 0;
  const totalGuests = adults + children;

  useEffect(() => {
    async function fetchAccommodation() {
      try {
        const res = await fetch(`/api/accommodations/${params.id}`);
        const data = await res.json();
        setAccommodation(data.accommodation);
      } catch {
        toast.error('숙소 정보를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    fetchAccommodation();
  }, [params.id]);

  if (loading) {
    return <div className="max-w-4xl mx-auto p-6"><p>예약 정보를 불러오는 중...</p></div>;
  }

  if (!accommodation || !checkIn || !checkOut || nights <= 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <p>유효하지 않은 예약 정보입니다. 숙소 상세페이지에서 다시 시도해주세요.</p>
        <Button onClick={() => router.back()} className="mt-4">돌아가기</Button>
      </div>
    );
  }

  const basePrice = Number(accommodation.base_price);
  const cleaningFee = Number(accommodation.cleaning_fee || 0);
  const accommodationTotal = basePrice * nights;
  const serviceFee = Math.floor(accommodationTotal * 0.1);
  const totalBeforeDiscount = accommodationTotal + cleaningFee + serviceFee;
  const totalAmount = totalBeforeDiscount - discount;

  const applyCoupon = async () => {
    if (!couponCode) return;
    try {
      const res = await fetch(`/api/coupons/validate?code=${couponCode}&amount=${accommodationTotal}`);
      const data = await res.json();
      if (data.discount) {
        setDiscount(data.discount);
        toast.success('쿠폰이 적용되었습니다.');
      } else {
        toast.error(data.error || '유효하지 않은 쿠폰입니다.');
      }
    } catch {
      toast.error('쿠폰 확인에 실패했습니다.');
    }
  };

  const handleBooking = async () => {
    if (!agreed) {
      toast.error('예약 정책에 동의해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accommodationId: accommodation.id,
          checkInDate: format(checkIn, 'yyyy-MM-dd'),
          checkOutDate: format(checkOut, 'yyyy-MM-dd'),
          guests: totalGuests,
          couponCode: couponCode || undefined,
          specialRequests,
          paymentMethod: 'card',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error);
        return;
      }

      // 개발환경: 모의 결제
      const paymentRes = await fetch('/api/payments/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentKey: `toss_${Date.now()}`,
          orderId: data.reservation.reservationNumber,
          amount: data.reservation.totalAmount,
        }),
      });

      const paymentData = await paymentRes.json();

      if (paymentData.success) {
        router.push(`/payment-complete/${paymentData.reservation.id}`);
      } else {
        toast.error(paymentData.error || '결제에 실패했습니다.');
      }
    } catch {
      toast.error('예약 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const imageUrl = accommodation.accommodation_photos?.[0]?.url || '/placeholder.jpg';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">예약 확인</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* 왼쪽: 예약 정보 */}
        <div className="md:col-span-3 space-y-6">
          {/* 숙소 요약 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={imageUrl} alt={accommodation.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="font-semibold">{accommodation.name}</h3>
                  <p className="text-sm text-gray-500">{accommodation.address}</p>
                  <p className="text-sm text-gray-500">
                    호스트: {accommodation.users_accommodations_host_idTousers?.display_name}
                  </p>
                  {accommodation.avg_rating > 0 && (
                    <p className="text-sm">★ {accommodation.avg_rating.toFixed(1)} ({accommodation.review_count}개 리뷰)</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 일정 */}
          <Card>
            <CardHeader><CardTitle className="text-lg">일정</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">체크인</p>
                  <p className="font-medium">{format(checkIn, 'yyyy년 M월 d일 (EEE)', { locale: ko })}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">체크아웃</p>
                  <p className="font-medium">{format(checkOut, 'yyyy년 M월 d일 (EEE)', { locale: ko })}</p>
                </div>
              </div>
              <p className="text-sm text-gray-500">{nights}박 · 게스트 {totalGuests}명</p>
            </CardContent>
          </Card>

          {/* 쿠폰 */}
          <Card>
            <CardHeader><CardTitle className="text-lg">쿠폰</CardTitle></CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  placeholder="쿠폰 코드를 입력하세요"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <Button variant="outline" onClick={applyCoupon}>적용</Button>
              </div>
              {discount > 0 && (
                <p className="text-sm text-green-600 mt-2">-{discount.toLocaleString()}원 할인 적용됨</p>
              )}
            </CardContent>
          </Card>

          {/* 특별 요청 */}
          <Card>
            <CardHeader><CardTitle className="text-lg">특별 요청사항</CardTitle></CardHeader>
            <CardContent>
              <Textarea
                placeholder="호스트에게 전달할 특별 요청사항이 있으면 입력하세요 (선택)"
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* 오른쪽: 요금 내역 */}
        <div className="md:col-span-2">
          <Card className="sticky top-24">
            <CardHeader><CardTitle className="text-lg">요금 내역</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>₩{basePrice.toLocaleString()} × {nights}박</span>
                <span>₩{accommodationTotal.toLocaleString()}</span>
              </div>
              {cleaningFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span>청소비</span>
                  <span>₩{cleaningFee.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span>서비스 수수료</span>
                <span>₩{serviceFee.toLocaleString()}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>쿠폰 할인</span>
                  <span>-₩{discount.toLocaleString()}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>총 합계</span>
                <span>₩{totalAmount.toLocaleString()}</span>
              </div>

              <Separator />

              <div className="text-xs text-gray-500 space-y-1">
                <p>취소 정책: {accommodation.cancellation_policy === 'flexible' ? '유연' : accommodation.cancellation_policy === 'moderate' ? '보통' : '엄격'}</p>
              </div>

              <div className="flex items-start gap-2 mt-4">
                <Checkbox
                  id="agree"
                  checked={agreed}
                  onCheckedChange={(v) => setAgreed(v === true)}
                />
                <Label htmlFor="agree" className="text-xs leading-tight">
                  숙소 이용규칙, 환불 정책 및 게스트 환불 정책에 동의합니다.
                </Label>
              </div>

              <Button
                className="w-full bg-rose-500 hover:bg-rose-600 mt-4"
                size="lg"
                disabled={submitting || !agreed}
                onClick={handleBooking}
              >
                {submitting ? '처리 중...' : `₩${totalAmount.toLocaleString()} 결제하기`}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
