'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
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
  created_at: string;
  users: { display_name: string; email: string };
  accommodations: { name: string; users: { display_name: string } };
}

export default function AdminReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  async function fetchReservations() {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/reservations?${params}`);
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

  async function forceCancel(id: number) {
    if (!confirm('정말 강제 취소하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/admin/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'force_cancel' }),
      });
      if (res.ok) {
        toast.success('예약이 강제 취소되었습니다.');
        fetchReservations();
      }
    } catch {
      toast.error('처리에 실패했습니다.');
    }
  }

  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    pending: { label: '대기', variant: 'secondary' },
    confirmed: { label: '확정', variant: 'default' },
    completed: { label: '완료', variant: 'outline' },
    cancelled: { label: '취소', variant: 'destructive' },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">예약 관리</h1>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input placeholder="예약번호 검색" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchReservations()} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="pending">대기</SelectItem>
            <SelectItem value="confirmed">확정</SelectItem>
            <SelectItem value="completed">완료</SelectItem>
            <SelectItem value="cancelled">취소</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">예약번호</th>
                  <th className="text-left py-3 px-4">게스트</th>
                  <th className="text-left py-3 px-4">숙소</th>
                  <th className="text-left py-3 px-4">일정</th>
                  <th className="text-right py-3 px-4">금액</th>
                  <th className="text-left py-3 px-4">상태</th>
                  <th className="text-right py-3 px-4">작업</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50">
                    <td className="py-3 px-4 font-mono text-xs">{r.reservation_number}</td>
                    <td className="py-3 px-4">{r.users?.display_name}</td>
                    <td className="py-3 px-4 max-w-[200px] truncate">{r.accommodations?.name}</td>
                    <td className="py-3 px-4 text-xs">
                      {format(new Date(r.checkin_date), 'M/d')} - {format(new Date(r.checkout_date), 'M/d')}
                    </td>
                    <td className="py-3 px-4 text-right">₩{Number(r.total_price).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={statusMap[r.status]?.variant}>{statusMap[r.status]?.label || r.status}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {['pending', 'confirmed'].includes(r.status) && (
                        <Button variant="destructive" size="sm" onClick={() => forceCancel(r.id)}>강제취소</Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
