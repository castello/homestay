'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, TrendingUp, Eye, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface Stats {
  totalViews: number;
  totalBookings: number;
  totalRevenue: number;
  averageRating: number;
  occupancyRate: number;
  monthlyRevenue: { month: string; revenue: number }[];
  propertyStats: { id: number; name: string; views: number; bookings: number; revenue: number }[];
}

export default function HostStatisticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [period, setPeriod] = useState('30');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [period]);

  async function fetchStats() {
    try {
      const res = await fetch(`/api/host/statistics?days=${period}`);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg"><Eye className="text-blue-500" size={20} /></div>
              <div>
                <p className="text-sm text-gray-500">조회수</p>
                <p className="text-2xl font-bold">{stats?.totalViews?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg"><TrendingUp className="text-green-500" size={20} /></div>
              <div>
                <p className="text-sm text-gray-500">예약 수</p>
                <p className="text-2xl font-bold">{stats?.totalBookings || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-50 rounded-lg"><DollarSign className="text-yellow-500" size={20} /></div>
              <div>
                <p className="text-sm text-gray-500">수익</p>
                <p className="text-2xl font-bold">₩{stats?.totalRevenue?.toLocaleString() || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg"><BarChart3 className="text-purple-500" size={20} /></div>
              <div>
                <p className="text-sm text-gray-500">평균 평점</p>
                <p className="text-2xl font-bold">★ {stats?.averageRating?.toFixed(1) || '0.0'}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {stats?.propertyStats && stats.propertyStats.length > 0 && (
        <Card>
          <CardHeader><CardTitle>숙소별 통계</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">숙소명</th>
                    <th className="text-right py-2 px-3">조회수</th>
                    <th className="text-right py-2 px-3">예약수</th>
                    <th className="text-right py-2 px-3">수익</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.propertyStats.map(p => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2 px-3">{p.name}</td>
                      <td className="text-right py-2 px-3">{p.views.toLocaleString()}</td>
                      <td className="text-right py-2 px-3">{p.bookings}</td>
                      <td className="text-right py-2 px-3">₩{p.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
