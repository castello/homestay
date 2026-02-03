'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Heart, CalendarDays, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: Home, label: '홈' },
  { href: '/search', icon: Search, label: '검색' },
  { href: '/mypage?tab=wishlists', icon: Heart, label: '위시리스트' },
  { href: '/mypage?tab=reservations', icon: CalendarDays, label: '예약' },
  { href: '/mypage', icon: User, label: '프로필' },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t z-50">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href.split('?')[0]));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 text-xs',
                isActive ? 'text-rose-500' : 'text-gray-500'
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
