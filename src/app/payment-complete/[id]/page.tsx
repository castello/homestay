'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ReservationDetail {
  id: number;
  reservation_number: string;
  checkin_date: string;
  checkout_date: string;
  guests: number;
  total_price: number;
  status: string;
  accommodations: {
    id: number;
    name: string;
    address: string;
    checkin_time: string;
    checkout_time: string;
    users: { display_name: string };
  };
}

export default function PaymentCompletePage() {
  const params = useParams();
  const [reservation, setReservation] = useState<ReservationDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReservation() {
      try {
        const res = await fetch(`/api/reservations/${params.id}`);
        if (res.ok) {
          const data = await res.json();
          setReservation(data.reservation);
        }
      } catch (e) {
        console.error('Failed to fetch reservation', e);
      } finally {
        setLoading(false);
      }
    }
    fetchReservation();
  }, [params.id]);

  if (loading) {
    return <div className="max-w-2xl mx-auto p-6 text-center"><p>로딩 중...</p></div>;
  }

  if (!reservation) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <p>예약 정보를 찾을 수 없습니다.</p>
        <Link href="/mypage?tab=reservations"><Button className="mt-4">내 예약 보기</Button></Link>
      </div>
    );
  }

  const checkIn = new Date(reservation.checkin_date);
  const checkOut = new Date(reservation.checkout_date);

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      <div className="text-center mb-8">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">예약이 확정되었습니다!</h1>
        <p className="text-gray-500">예약번호: {reservation.reservation_number}</p>
      </div>

      <Card className="mb-6">
        <CardContent className="p-6 space-y-4">
          <h2 className="font-semibold text-lg">{reservation.accommodations.name}</h2>
          <p className="text-sm text-gray-500">{reservation.accommodations.address}</p>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">체크인</p>
              <p className="font-medium">{format(checkIn, 'yyyy년 M월 d일 (EEE)', { locale: ko })}</p>
              <p className="text-gray-500">{reservation.accommodations.checkin_time || '15:00'} 이후</p>
            </div>
            <div>
              <p className="text-gray-500">체크아웃</p>
              <p className="font-medium">{format(checkOut, 'yyyy년 M월 d일 (EEE)', { locale: ko })}</p>
              <p className="text-gray-500">{reservation.accommodations.checkout_time || '11:00'} 이전</p>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between">
            <span>게스트</span>
            <span>{reservation.guests}명</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>결제 금액</span>
            <span>₩{Number(reservation.total_price).toLocaleString()}</span>
          </div>

          <Separator />

          <div>
            <p className="text-sm text-gray-500">호스트</p>
            <p className="font-medium">{reservation.accommodations.users?.display_name}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Link href="/mypage?tab=reservations" className="flex-1">
          <Button variant="outline" className="w-full">내 예약 보기</Button>
        </Link>
        <Link href={`/messages`} className="flex-1">
          <Button className="w-full bg-rose-500 hover:bg-rose-600">호스트에게 메시지</Button>
        </Link>
      </div>
    </div>
  );
}
