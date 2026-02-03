'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Search, MoreHorizontal, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Accommodation {
  id: number;
  name: string;
  address: string;
  status: string;
  is_active: boolean;
  base_price: number;
  avg_rating: number;
  review_count: number;
  accommodation_photos: { url: string }[];
  users: { display_name: string };
}

export default function AdminAccommodationsPage() {
  const [accommodations, setAccommodations] = useState<Accommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchAccommodations();
  }, [statusFilter]);

  async function fetchAccommodations() {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/accommodations?${params}`);
      if (res.ok) {
        const data = await res.json();
        setAccommodations(data.accommodations || []);
      }
    } catch {
      toast.error('숙소 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      const res = await fetch(`/api/admin/accommodations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        toast.success('숙소 상태가 변경되었습니다.');
        fetchAccommodations();
      }
    } catch {
      toast.error('상태 변경에 실패했습니다.');
    }
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      pending: { label: '승인대기', variant: 'secondary' },
      approved: { label: '승인', variant: 'default' },
      rejected: { label: '거절', variant: 'destructive' },
      suspended: { label: '정지', variant: 'outline' },
    };
    const s = map[status] || { label: status, variant: 'secondary' as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">숙소 관리</h1>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input placeholder="숙소명으로 검색" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchAccommodations()} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32"><SelectValue placeholder="상태" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="pending">승인대기</SelectItem>
            <SelectItem value="approved">승인</SelectItem>
            <SelectItem value="rejected">거절</SelectItem>
            <SelectItem value="suspended">정지</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {accommodations.map((acc) => (
          <Card key={acc.id}>
            <CardContent className="p-4">
              <div className="flex gap-4">
                <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={acc.accommodation_photos?.[0]?.url || '/placeholder.jpg'} alt={acc.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{acc.name}</h3>
                    {statusBadge(acc.status)}
                  </div>
                  <p className="text-sm text-gray-500">{acc.address}</p>
                  <p className="text-sm text-gray-500">호스트: {acc.users?.display_name} · ₩{Number(acc.base_price).toLocaleString()}/박</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon"><MoreHorizontal size={16} /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => updateStatus(acc.id, 'approved')}><Check size={14} className="mr-1" /> 승인</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateStatus(acc.id, 'rejected')}><X size={14} className="mr-1" /> 거절</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => updateStatus(acc.id, 'suspended')} className="text-red-600">정지</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
