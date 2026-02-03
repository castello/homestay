'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Bell, Menu, User, Globe, MessageSquare, Heart, CalendarDays, LogOut, LayoutDashboard, X } from 'lucide-react';
import { useNotificationStore } from '@/stores/notification-store';
import { useUIStore } from '@/stores/ui-store';
import { LANGUAGES, CURRENCIES } from '@/lib/constants';

export function Header() {
  const { data: session } = useSession();
  const user = session?.user as any;
  const { unreadCount, unreadMessageCount } = useNotificationStore();
  const { language, currency, setLanguage, setCurrency, isMobileMenuOpen, toggleMobileMenu, closeMobileMenu } = useUIStore();

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-rose-500" onClick={closeMobileMenu}>
          홈스테이
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm"><Globe size={16} className="mr-1" />{language.toUpperCase()}</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {LANGUAGES.map((l) => (
                <DropdownMenuItem key={l.value} onClick={() => setLanguage(l.value)}>{l.label}</DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              {CURRENCIES.map((c) => (
                <DropdownMenuItem key={c.value} onClick={() => setCurrency(c.value)}>{c.label}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {session ? (
            <>
              <Link href="/messages">
                <Button variant="ghost" size="sm" className="relative">
                  <MessageSquare size={18} />
                  {unreadMessageCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{unreadMessageCount}</span>
                  )}
                </Button>
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative">
                    <Bell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{unreadCount}</span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="p-3 text-sm text-gray-500">알림이 없습니다</div>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                      {user?.image ? (
                        <img src={user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <span className="hidden lg:inline text-sm">{user?.displayName || user?.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild><Link href="/mypage"><User size={16} className="mr-2" />마이페이지</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/messages"><MessageSquare size={16} className="mr-2" />메시지</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/mypage?tab=wishlists"><Heart size={16} className="mr-2" />윈시리스트</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link href="/mypage?tab=reservations"><CalendarDays size={16} className="mr-2" />예약 내역</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {user?.role === 'host' || user?.role === 'admin' ? (
                    <DropdownMenuItem asChild><Link href="/host"><LayoutDashboard size={16} className="mr-2" />호스트 모드</Link></DropdownMenuItem>
                  ) : null}
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild><Link href="/admin"><LayoutDashboard size={16} className="mr-2" />관리자</Link></DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}><LogOut size={16} className="mr-2" />로그아웃</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"><Button variant="ghost" size="sm">로그인</Button></Link>
              <Link href="/signup"><Button size="sm">회원가입</Button></Link>
            </div>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-3">
          {session ? (
            <>
              <Link href="/mypage" className="block py-2" onClick={closeMobileMenu}>마이페이지</Link>
              <Link href="/messages" className="block py-2" onClick={closeMobileMenu}>메시지</Link>
              <Link href="/mypage?tab=wishlists" className="block py-2" onClick={closeMobileMenu}>위시리스트</Link>
              <Link href="/mypage?tab=reservations" className="block py-2" onClick={closeMobileMenu}>예약 내역</Link>
              {(user?.role === 'host' || user?.role === 'admin') && (
                <Link href="/host" className="block py-2" onClick={closeMobileMenu}>호스트 대시보드</Link>
              )}
              <button className="block py-2 text-red-500" onClick={() => { signOut({ callbackUrl: '/' }); closeMobileMenu(); }}>로그아웃</button>
            </>
          ) : (
            <>
              <Link href="/login" className="block py-2" onClick={closeMobileMenu}>로그인</Link>
              <Link href="/signup" className="block py-2" onClick={closeMobileMenu}>회원가입</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
