'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatsCard } from '@/components/host/stats-card';
import { StatusBadge } from '@/components/admin/status-badge';
import { CalendarDays, DollarSign, Star, MessageSquare, Home, Clock, Loader2 } from 'lucide-react';

interface DashboardData {
  stats: {
    todayCheckins: number;
    todayCheckouts: number;
    pendingReservations: number;
    monthlyRevenue: number;
    totalProperties: number;
    activeProperties: number;
    avgRating: string;
    unreadMessages: number;
  };
  recentReservations: Array<{
    id: number;
    reservation_number: string;
    status: string;
    checkin_date: string;
    checkout_date: string;
    total_price: number;
    users_reservations_guest_idTousers: { display_name: string };
    accommodations: { name: string };
  }>;
}

export default function HostDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch('/api/host/dashboard');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">호스트 대시보드</h1>
        <Button asChild className="bg-rose-500 hover:bg-rose-600">
          <Link href="/host/properties/new">새 숙소 등록</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="오늘 체크인" value={stats?.todayCheckins ?? 0} icon={CalendarDays} />
        <StatsCard
          title="이번달 수익"
          value={`\u20A9${(stats?.monthlyRevenue ?? 0).toLocaleString()}`}
          icon={DollarSign}
        />
        <StatsCard title="평균 평점" value={stats?.avgRating ?? '-'} icon={Star} />
        <StatsCard title="안읽은 메시지" value={stats?.unreadMessages ?? 0} icon={MessageSquare} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">승인 대기</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-rose-500">{stats?.pendingReservations ?? 0}</div>
            {(stats?.pendingReservations ?? 0) > 0 && (
              <Button variant="link" asChild className="px-0 text-rose-500">
                <Link href="/host/reservations?status=pending">확인하기</Link>
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">오늘 체크아웃</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.todayCheckouts ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">등록 숙소</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.activeProperties ?? 0} <span className="text-sm font-normal text-gray-400">/ {stats?.totalProperties ?? 0}</span></div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Reservations */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>최근 예약</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/host/reservations">전체보기</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data?.recentReservations && data.recentReservations.length > 0 ? (
            <div className="space-y-3">
              {data.recentReservations.map((res) => (
                <div key={res.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm truncate">{res.accommodations?.name}</p>
                      <StatusBadge status={res.status} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {res.users_reservations_guest_idTousers?.display_name} &middot;{' '}
                      {format(new Date(res.checkin_date), 'M/d', { locale: ko })} - {format(new Date(res.checkout_date), 'M/d', { locale: ko })}
                    </p>
                  </div>
                  <p className="text-sm font-medium">{'\u20A9'}{Number(res.total_price).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-4">최근 예약이 없습니다</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
