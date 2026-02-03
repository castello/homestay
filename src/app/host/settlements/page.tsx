'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { EmptyState } from '@/components/common/empty-state';

interface Settlement {
  id: number;
  amount: number;
  commission_amount: number;
  net_amount: number;
  status: string;
  settlement_date: string;
  created_at: string;
}

export default function HostSettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, totalCommission: 0, totalNet: 0, pendingAmount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSettlements() {
      try {
        const res = await fetch('/api/host/settlements');
        if (res.ok) {
          const data = await res.json();
          setSettlements(data.settlements || []);
          setSummary(data.summary || summary);
        }
      } catch {
        toast.error('정산 내역을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    fetchSettlements();
  }, []);

  if (loading) return <div className="p-6"><p>로딩 중...</p></div>;

  const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
    pending: { label: '대기', variant: 'secondary' },
    completed: { label: '완료', variant: 'default' },
    processing: { label: '처리중', variant: 'outline' },
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">정산</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">총 수익</p><p className="text-xl font-bold">₩{summary.totalRevenue.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">수수료</p><p className="text-xl font-bold text-red-500">-₩{summary.totalCommission.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">순수익</p><p className="text-xl font-bold text-green-600">₩{summary.totalNet.toLocaleString()}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-sm text-gray-500">정산 대기</p><p className="text-xl font-bold text-orange-500">₩{summary.pendingAmount.toLocaleString()}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>정산 내역</CardTitle></CardHeader>
        <CardContent>
          {settlements.length === 0 ? (
            <EmptyState title="정산 내역이 없습니다" />
          ) : (
            <div className="space-y-3">
              {settlements.map(s => (
                <div key={s.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">₩{s.net_amount.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">
                      총 ₩{s.amount.toLocaleString()} - 수수료 ₩{s.commission_amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-400">
                      {s.settlement_date ? format(new Date(s.settlement_date), 'yyyy.M.d', { locale: ko }) : '-'}
                    </p>
                  </div>
                  <Badge variant={statusMap[s.status]?.variant || 'secondary'}>
                    {statusMap[s.status]?.label || s.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
