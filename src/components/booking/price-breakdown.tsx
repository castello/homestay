'use client';

import { Separator } from '@/components/ui/separator';

interface PriceBreakdownProps {
  accommodationFee: number;
  nights: number;
  cleaningFee?: number;
  extraGuestFee?: number;
  longStayDiscount?: number;
  serviceFee: number;
  discount?: number;
  total: number;
}

export function PriceBreakdown({
  accommodationFee,
  nights,
  cleaningFee = 0,
  extraGuestFee = 0,
  longStayDiscount = 0,
  serviceFee,
  discount = 0,
  total,
}: PriceBreakdownProps) {
  const nightlyAvg = nights > 0 ? Math.round(accommodationFee / nights) : 0;

  return (
    <div className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span>{'\u20A9'}{nightlyAvg.toLocaleString()} x {nights}박</span>
        <span>{'\u20A9'}{accommodationFee.toLocaleString()}</span>
      </div>
      {extraGuestFee > 0 && (
        <div className="flex justify-between">
          <span>추가 인원 요금</span>
          <span>{'\u20A9'}{extraGuestFee.toLocaleString()}</span>
        </div>
      )}
      {cleaningFee > 0 && (
        <div className="flex justify-between">
          <span>청소비</span>
          <span>{'\u20A9'}{cleaningFee.toLocaleString()}</span>
        </div>
      )}
      {longStayDiscount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>장기 숙박 할인</span>
          <span>-{'\u20A9'}{longStayDiscount.toLocaleString()}</span>
        </div>
      )}
      <div className="flex justify-between">
        <span>서비스 수수료</span>
        <span>{'\u20A9'}{serviceFee.toLocaleString()}</span>
      </div>
      {discount > 0 && (
        <div className="flex justify-between text-green-600">
          <span>쿠폰 할인</span>
          <span>-{'\u20A9'}{discount.toLocaleString()}</span>
        </div>
      )}
      <Separator />
      <div className="flex justify-between font-bold text-base">
        <span>총 합계</span>
        <span>{'\u20A9'}{total.toLocaleString()}</span>
      </div>
    </div>
  );
}
