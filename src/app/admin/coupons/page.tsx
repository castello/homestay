'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Coupon {
  id: number;
  code: string;
  name: string;
  discount_type: string;
  discount_value: number;
  min_order_amount: number | null;
  max_discount_amount: number | null;
  max_usage: number | null;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    code: '',
    name: '',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 0,
    max_discount_amount: 0,
    max_usage: 100,
    valid_from: '',
    valid_until: '',
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  async function fetchCoupons() {
    try {
      const res = await fetch('/api/admin/coupons');
      if (res.ok) {
        const data = await res.json();
        setCoupons(data.coupons || []);
      }
    } catch {
      toast.error('쿠폰 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }

  async function createCoupon() {
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        toast.success('쿠폰이 생성되었습니다.');
        setShowCreate(false);
        fetchCoupons();
      } else {
        const data = await res.json();
        toast.error(data.error || '쿠폰 생성에 실패했습니다.');
      }
    } catch {
      toast.error('쿠폰 생성에 실패했습니다.');
    }
  }

  async function toggleCoupon(id: number, isActive: boolean) {
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !isActive }),
      });
      if (res.ok) {
        toast.success(isActive ? '쿠폰이 비활성화되었습니다.' : '쿠폰이 활성화되었습니다.');
        fetchCoupons();
      }
    } catch {
      toast.error('처리에 실패했습니다.');
    }
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">쿠폰 관리</h1>
        <Dialog open={showCreate} onOpenChange={setShowCreate}>
          <DialogTrigger asChild>
            <Button className="bg-rose-500 hover:bg-rose-600"><Plus size={16} className="mr-1" /> 쿠폰 생성</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>새 쿠폰 생성</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>쿠폰 코드</Label><Input value={form.code} onChange={(e) => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="예: WELCOME2026" /></div>
              <div><Label>쿠폰명</Label><Input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} placeholder="웰컴 쿠폰" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>할인 유형</Label>
                  <Select value={form.discount_type} onValueChange={(v) => setForm(f => ({ ...f, discount_type: v }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">퍼센트</SelectItem>
                      <SelectItem value="fixed">정액</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>할인값</Label>
                  <Input type="number" value={form.discount_value} onChange={(e) => setForm(f => ({ ...f, discount_value: parseInt(e.target.value) }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>최소 주문금액</Label><Input type="number" value={form.min_order_amount} onChange={(e) => setForm(f => ({ ...f, min_order_amount: parseInt(e.target.value) }))} /></div>
                <div><Label>최대 할인금액</Label><Input type="number" value={form.max_discount_amount} onChange={(e) => setForm(f => ({ ...f, max_discount_amount: parseInt(e.target.value) }))} /></div>
              </div>
              <div><Label>사용 한도</Label><Input type="number" value={form.max_usage} onChange={(e) => setForm(f => ({ ...f, max_usage: parseInt(e.target.value) }))} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>시작일</Label><Input type="date" value={form.valid_from} onChange={(e) => setForm(f => ({ ...f, valid_from: e.target.value }))} /></div>
                <div><Label>종료일</Label><Input type="date" value={form.valid_until} onChange={(e) => setForm(f => ({ ...f, valid_until: e.target.value }))} /></div>
              </div>
              <Button onClick={createCoupon} className="w-full bg-rose-500 hover:bg-rose-600">생성</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4">코드</th>
                  <th className="text-left py-3 px-4">이름</th>
                  <th className="text-left py-3 px-4">할인</th>
                  <th className="text-right py-3 px-4">사용/한도</th>
                  <th className="text-left py-3 px-4">기간</th>
                  <th className="text-left py-3 px-4">상태</th>
                  <th className="text-right py-3 px-4">작업</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="py-3 px-4 font-mono">{c.code}</td>
                    <td className="py-3 px-4">{c.name}</td>
                    <td className="py-3 px-4">{c.discount_type === 'percentage' ? `${c.discount_value}%` : `₩${Number(c.discount_value).toLocaleString()}`}</td>
                    <td className="py-3 px-4 text-right">{c.used_count}/{c.max_usage || '∞'}</td>
                    <td className="py-3 px-4 text-xs">{format(new Date(c.valid_from), 'yy.MM.dd')} ~ {format(new Date(c.valid_until), 'yy.MM.dd')}</td>
                    <td className="py-3 px-4">
                      <Badge variant={c.is_active ? 'default' : 'secondary'}>{c.is_active ? '활성' : '비활성'}</Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button variant="outline" size="sm" onClick={() => toggleCoupon(c.id, c.is_active)}>
                        {c.is_active ? '비활성화' : '활성화'}
                      </Button>
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
