'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common/empty-state';

interface Reservation {
  id: number;
  reservation_number: string;
  checkin_date: string;
  checkout_date: string;
  guests: number;
  total_price: number;
  status: string;
  special_requests: string | null;
  created_at: string;
  users: { id: number; display_name: string; profile_photo_url: string };
  accommodations: { id: number; name: string };
}

const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: '승인 대기', variant: 'secondary' },
  confirmed: { label: '확정', variant: 'default' },
  completed: { label: '완료', variant: 'outline' },
  cancelled: { label: '취소', variant: 'destructive' },
};

export default function HostReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReservations();
  }, []);

  async function fetchReservations() {
    try {
      const res = await fetch('/api/host/reservations');
      if (res.ok) {
        const data = await res.json();
        setReservations(data.reservations || []);
      }
    } catch {
      toast.error('예약 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id: number, action: string) {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        toast.success(action === 'confirm' ? '예약을 승인했습니다.' : '예약을 거절했습니다.');
        fetchReservations();
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch {
      toast.error('처리에 실패했습니다.');
    }
  }

  const filtered = filter === 'all' ? reservations : reservations.filter(r => r.status === filter);

  if (loading) return <div className="p-6"><p>로딩 중...</p></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">예약 관리</h1>

      <Tabs value={filter} onValueChange={setFilter} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">전체</TabsTrigger>
          <TabsTrigger value="pending">대기중</TabsTrigger>
          <TabsTrigger value="confirmed">확정</TabsTrigger>
          <TabsTrigger value="completed">완료</TabsTrigger>
          <TabsTrigger value="cancelled">취소</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState title="예약이 없습니다" />
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium">{r.accommodations.name}</h3>
                      <Badge variant={statusMap[r.status]?.variant}>{statusMap[r.status]?.label}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">
                      게스트: {r.users.display_name} · {r.guests}명
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(r.checkin_date), 'M월 d일', { locale: ko })} - {format(new Date(r.checkout_date), 'M월 d일', { locale: ko })}
                    </p>
                    <p className="text-sm font-medium mt-1">₩{Number(r.total_price).toLocaleString()}</p>
                    {r.special_requests && (
                      <p className="text-xs text-gray-400 mt-1">요청사항: {r.special_requests}</p>
                    )}
                    <p className="text-xs text-gray-400">예약번호: {r.reservation_number}</p>
                  </div>
                  {r.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-rose-500 hover:bg-rose-600" onClick={() => handleAction(r.id, 'confirm')}>승인</Button>
                      <Button size="sm" variant="outline" onClick={() => handleAction(r.id, 'reject')}>거절</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
