'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Home, CalendarDays, DollarSign, TrendingUp, Star } from 'lucide-react';
import { toast } from 'sonner';

interface AdminStats {
  totalUsers: number;
  totalAccommodations: number;
  totalReservations: number;
  totalRevenue: number;
  newUsersThisMonth: number;
  newReservationsThisMonth: number;
  topAccommodations: { id: number; name: string; bookings: number; revenue: number }[];
}

export default function AdminStatisticsPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch(`/api/admin/statistics?days=${period}`);
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
        }
      } catch {
        toast.error('통계를 불러오는데 실패했습니다.');
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, [period]);

  if (loading) return <div className="p-6"><p>로딩 중...</p></div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">통계</h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">최근 7일</SelectItem>
            <SelectItem value="30">최근 30일</SelectItem>
            <SelectItem value="90">최근 90일</SelectItem>
            <SelectItem value="365">최근 1년</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-blue-50 rounded-lg"><Users className="text-blue-500" size={20} /></div><div><p className="text-sm text-gray-500">총 회원수</p><p className="text-2xl font-bold">{stats?.totalUsers?.toLocaleString() || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-green-50 rounded-lg"><Home className="text-green-500" size={20} /></div><div><p className="text-sm text-gray-500">총 숙소수</p><p className="text-2xl font-bold">{stats?.totalAccommodations || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-yellow-50 rounded-lg"><CalendarDays className="text-yellow-500" size={20} /></div><div><p className="text-sm text-gray-500">총 예약수</p><p className="text-2xl font-bold">{stats?.totalReservations || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-purple-50 rounded-lg"><DollarSign className="text-purple-500" size={20} /></div><div><p className="text-sm text-gray-500">총 매출</p><p className="text-2xl font-bold">₩{stats?.totalRevenue?.toLocaleString() || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-rose-50 rounded-lg"><TrendingUp className="text-rose-500" size={20} /></div><div><p className="text-sm text-gray-500">이번달 신규 회원</p><p className="text-2xl font-bold">{stats?.newUsersThisMonth || 0}</p></div></CardContent></Card>
        <Card><CardContent className="p-4 flex items-center gap-3"><div className="p-2 bg-orange-50 rounded-lg"><Star className="text-orange-500" size={20} /></div><div><p className="text-sm text-gray-500">이번달 예약</p><p className="text-2xl font-bold">{stats?.newReservationsThisMonth || 0}</p></div></CardContent></Card>
      </div>

      {stats?.topAccommodations && stats.topAccommodations.length > 0 && (
        <Card>
          <CardHeader><CardTitle>인기 숙소 Top 10</CardTitle></CardHeader>
          <CardContent>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3">순위</th>
                  <th className="text-left py-2 px-3">숙소명</th>
                  <th className="text-right py-2 px-3">예약수</th>
                  <th className="text-right py-2 px-3">매출</th>
                </tr>
              </thead>
              <tbody>
                {stats.topAccommodations.map((acc, i) => (
                  <tr key={acc.id} className="border-b last:border-0">
                    <td className="py-2 px-3">{i + 1}</td>
                    <td className="py-2 px-3">{acc.name}</td>
                    <td className="text-right py-2 px-3">{acc.bookings}</td>
                    <td className="text-right py-2 px-3">₩{acc.revenue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
