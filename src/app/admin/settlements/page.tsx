'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
  users: { display_name: string };
}

export default function AdminSettlementsPage() {
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch_data() {
      try {
        const res = await fetch('/api/admin/settlements');
        if (res.ok) {
          const data = await res.json();
          setSettlements(data.settlements || []);
        }
      } catch {
        toast.error('정산 목록을 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    fetch_data();
  }, []);

  async function approveSettlement(id: number) {
    try {
      const res = await fetch(`/api/admin/settlements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'completed' }),
      });
      if (res.ok) {
        toast.success('정산이 승인되었습니다.');
        setSettlements(prev => prev.map(s => s.id === id ? { ...s, status: 'completed' } : s));
      }
    } catch {
      toast.error('처리에 실패했습니다.');
    }
  }

  if (loading) return <div className="p-6"><p>로딩 중...</p></div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">정산 관리</h1>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">ID</th>
                  <th className="text-left py-3 px-4">호스트</th>
                  <th className="text-right py-3 px-4">총액</th>
                  <th className="text-right py-3 px-4">수수료</th>
                  <th className="text-right py-3 px-4">순액</th>
                  <th className="text-left py-3 px-4">상태</th>
                  <th className="text-left py-3 px-4">정산일</th>
                  <th className="text-right py-3 px-4">작업</th>
                </tr>
              </thead>
              <tbody>
                {settlements.length === 0 ? (
                  <tr><td colSpan={8} className="py-8 text-center text-gray-500">정산 내역이 없습니다</td></tr>
                ) : (
                  settlements.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="py-3 px-4">{s.id}</td>
                      <td className="py-3 px-4">{s.users?.display_name}</td>
                      <td className="py-3 px-4 text-right">₩{Number(s.amount).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-red-500">₩{Number(s.commission_amount).toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-medium">₩{Number(s.net_amount).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge variant={s.status === 'completed' ? 'default' : 'secondary'}>
                          {s.status === 'completed' ? '완료' : '대기'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{s.settlement_date ? format(new Date(s.settlement_date), 'yy.MM.dd') : '-'}</td>
                      <td className="py-3 px-4 text-right">
                        {s.status === 'pending' && (
                          <Button size="sm" onClick={() => approveSettlement(s.id)}>승인</Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
