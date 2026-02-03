'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Home, CalendarDays, MessageSquare, Star, BarChart3, DollarSign, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/host', icon: LayoutDashboard, label: '대시보드' },
  { href: '/host/properties', icon: Home, label: '숙소 관리' },
  { href: '/host/reservations', icon: CalendarDays, label: '예약 관리' },
  { href: '/host/calendar', icon: CalendarDays, label: '캘린더' },
  { href: '/host/messages', icon: MessageSquare, label: '메시지' },
  { href: '/host/reviews', icon: Star, label: '리뷰 관리' },
  { href: '/host/statistics', icon: BarChart3, label: '통계' },
  { href: '/host/settlements', icon: DollarSign, label: '정산' },
  { href: '/host/settings', icon: Settings, label: '설정' },
];

export function HostSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r min-h-screen p-4 hidden lg:block">
      <div className="mb-6">
        <Link href="/host" className="text-lg font-bold text-rose-500">호스트 모드</Link>
      </div>
      <nav className="space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/host' && pathname.startsWith(item.href));
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
