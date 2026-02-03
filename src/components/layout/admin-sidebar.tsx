'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Home, CalendarDays, Flag, DollarSign, Ticket, FileText, Shield, BarChart3, Settings, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/admin', icon: LayoutDashboard, label: '대시보드' },
  { href: '/admin/users', icon: Users, label: '회원 관리' },
  { href: '/admin/accommodations', icon: Home, label: '숙소 관리' },
  { href: '/admin/reservations', icon: CalendarDays, label: '예약 관리' },
  { href: '/admin/reports', icon: Flag, label: '신고 관리' },
  { href: '/admin/settlements', icon: DollarSign, label: '정산 관리' },
  { href: '/admin/coupons', icon: Ticket, label: '쿠폰 관리' },
  { href: '/admin/content', icon: FileText, label: '콘텐츠 관리' },
  { href: '/admin/terms', icon: Shield, label: '약관 관리' },
  { href: '/admin/statistics', icon: BarChart3, label: '통계' },
  { href: '/admin/notifications', icon: Bell, label: '알림' },
  { href: '/admin/settings', icon: Settings, label: '시스템 설정' },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 hidden lg:block">
      <div className="mb-6">
        <Link href="/admin" className="text-lg font-bold text-rose-500">관리자</Link>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                isActive ? 'bg-rose-50 text-rose-600 font-medium' : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
