'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/host/stats-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { Users, Home, CalendarDays, Flag, DollarSign, Building, AlertTriangle, Loader2 } from 'lucide-react';

interface DashboardData {
  stats: {
    totalUsers: number;
    newUsersThisMonth: number;
    totalAccommodations: number;
    pendingAccommodations: number;
    monthlyReservations: number;
    prevMonthReservations: number;
    monthlyRevenue: number;
    prevMonthRevenue: number;
    pendingReports: number;
    pendingSettlements: number;
  };
  recentUsers: Array<{
    id: number;
    display_name: string;
    email: string;
    role: string;
    created_at: string;
  }>;
  recentReservations: Array<{
    id: number;
    reservation_number: string;
    status: string;
    total_price: number;
    created_at: string;
    users_reservations_guest_idTousers: { display_name: string };
    accommodations: { name: string };
  }>;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/admin/dashboard');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        console.error('Failed to fetch dashboard');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const stats = data?.stats;
  const revenueTrend = stats && stats.prevMonthRevenue > 0
    ? Math.round(((stats.monthlyRevenue - stats.prevMonthRevenue) / stats.prevMonthRevenue) * 100)
    : 0;
  const reservationTrend = stats && stats.prevMonthReservations > 0
    ? Math.round(((stats.monthlyReservations - stats.prevMonthReservations) / stats.prevMonthReservations) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">관리자 대시보드</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="총 회원"
          value={stats?.totalUsers ?? 0}
          icon={Users}
          description={`이번달 신규 ${stats?.newUsersThisMonth ?? 0}명`}
        />
        <StatsCard
          title="등록 숙소"
          value={stats?.totalAccommodations ?? 0}
          icon={Home}
          description={`승인 대기 ${stats?.pendingAccommodations ?? 0}건`}
        />
        <StatsCard
          title="이번달 예약"
          value={stats?.monthlyReservations ?? 0}
          icon={CalendarDays}
          trend={reservationTrend !== 0 ? { value: reservationTrend, positive: reservationTrend > 0 } : undefined}
        />
        <StatsCard
          title="이번달 매출"
          value={`\u20A9${(stats?.monthlyRevenue ?? 0).toLocaleString()}`}
          icon={DollarSign}
          trend={revenueTrend !== 0 ? { value: revenueTrend, positive: revenueTrend > 0 } : undefined}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">미처리 신고</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Flag size={20} className="text-red-500" />
              <span className="text-3xl font-bold">{stats?.pendingReports ?? 0}</span>
            </div>
            {(stats?.pendingReports ?? 0) > 0 && (
              <Button variant="link" asChild className="px-0 text-red-500">
                <Link href="/admin/reports">처리하기</Link>
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">대기 정산</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign size={20} className="text-yellow-500" />
              <span className="text-3xl font-bold">{stats?.pendingSettlements ?? 0}</span>
            </div>
            {(stats?.pendingSettlements ?? 0) > 0 && (
              <Button variant="link" asChild className="px-0 text-yellow-600">
                <Link href="/admin/settlements">처리하기</Link>
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">숙소 승인 대기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Building size={20} className="text-blue-500" />
              <span className="text-3xl font-bold">{stats?.pendingAccommodations ?? 0}</span>
            </div>
            {(stats?.pendingAccommodations ?? 0) > 0 && (
              <Button variant="link" asChild className="px-0 text-blue-500">
                <Link href="/admin/accommodations?status=pending">승인하기</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>최근 가입 회원</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/users">전체보기</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data?.recentUsers && data.recentUsers.length > 0 ? (
              <div className="space-y-3">
                {data.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{user.display_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={user.role} />
                      <p className="text-xs text-gray-400 mt-1">{format(new Date(user.created_at), 'M/d')}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">최근 가입 회원이 없습니다</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Reservations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>최근 예약</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/reservations">전체보기</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {data?.recentReservations && data.recentReservations.length > 0 ? (
              <div className="space-y-3">
                {data.recentReservations.map((res) => (
                  <div key={res.id} className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{res.accommodations?.name}</p>
                      <p className="text-xs text-gray-500">{res.users_reservations_guest_idTousers?.display_name}</p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={res.status} />
                      <p className="text-xs text-gray-400 mt-1">{'\u20A9'}{Number(res.total_price).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400 text-center py-4">최근 예약이 없습니다</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
