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
import { Bell, Menu, User, Globe, MessageSquare, Heart, CalendarDays, LogOut, LayoutDashboard, X, Search, Home, FileText, HelpCircle, Building2, ChevronDown } from 'lucide-react';
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

        {/* Desktop Nav - Main Menu */}
        <nav className="hidden md:flex items-center gap-1 ml-8">
          <Link href="/search">
            <Button variant="ghost" size="sm" className="gap-1">
              <Search size={16} />
              숙소 검색
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Building2 size={16} />
                숙소 유형
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild><Link href="/search?type=apartment">아파트</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/search?type=house">단독주택</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/search?type=villa">빌라</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/search?type=hanok">한옥</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/search?type=pension">펜션</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/search?type=hotel">호텔</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/search?type=guesthouse">게스트하우스</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <HelpCircle size={16} />
                고객지원
                <ChevronDown size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem asChild><Link href="/notices"><FileText size={16} className="mr-2" />공지사항</Link></DropdownMenuItem>
              <DropdownMenuItem asChild><Link href="/faq"><HelpCircle size={16} className="mr-2" />FAQ</Link></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link href="/host/properties/new">
            <Button variant="ghost" size="sm" className="gap-1">
              <Home size={16} />
              호스트 되기
            </Button>
          </Link>
        </nav>

        {/* Desktop Nav - User Menu */}
        <div className="hidden md:flex items-center gap-3 ml-auto">
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
        <div className="md:hidden bg-white border-t p-4 space-y-1">
          {/* Main navigation */}
          <div className="pb-3 border-b border-gray-100">
            <Link href="/search" className="flex items-center gap-2 py-2.5 px-2 rounded-lg hover:bg-gray-50" onClick={closeMobileMenu}>
              <Search size={18} className="text-gray-500" />
              숙소 검색
            </Link>
            <Link href="/notices" className="flex items-center gap-2 py-2.5 px-2 rounded-lg hover:bg-gray-50" onClick={closeMobileMenu}>
              <FileText size={18} className="text-gray-500" />
              공지사항
            </Link>
            <Link href="/faq" className="flex items-center gap-2 py-2.5 px-2 rounded-lg hover:bg-gray-50" onClick={closeMobileMenu}>
              <HelpCircle size={18} className="text-gray-500" />
              FAQ
            </Link>
            <Link href="/host/properties/new" className="flex items-center gap-2 py-2.5 px-2 rounded-lg hover:bg-gray-50" onClick={closeMobileMenu}>
              <Home size={18} className="text-gray-500" />
              호스트 되기
            </Link>
          </div>

          {/* Accommodation types */}
          <div className="py-3 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-400 px-2 mb-2">숙소 유형</p>
            <div className="grid grid-cols-2 gap-1">
              <Link href="/search?type=apartment" className="py-2 px-2 text-sm rounded-lg hover:bg-gray-50" onClick={closeMobileMenu}>아파트</Link>
              <Link href="/search?type=house" className="py-2 px-2 text-sm rounded-lg hover:bg-gray-50" onClick={closeMobileMenu}>단독주택</Link>
              <Link href="/search?type=villa" className="py-2 px-2 text-sm rounded-lg hover:bg-gray-50" onClick={closeMobileMenu}>빌라</Link>
              <Link href="/search?type=hanok" className="py-2 px-2 text-sm rounded-lg hover:bg-gray-50" onClick={closeMobileMenu}>한옥</Link>
              <Link href="/search?type=pension" className="py-2 px-2 text-sm rounded-lg hover:bg-gray-50" onClick={closeMobileMenu}>펜션</Link>
              <Link href="/search?type=hotel" className="py-2 px-2 text-sm rounded-lg hover:bg-gray-50" onClick={closeMobileMenu}>호텔</Link>
            </div>
          </div>

          {/* User menu */}
          <div className="pt-2">
            {session ? (
              <>
                <Link href="/mypage" className="flex items-center gap-2 py-2.5 px-2 rounded-lg hover:bg-gray-50" onClick={closeMobileMenu}>
                  <User size={18} className="text-gray-500" />
                  마이페이지
                </Link>
                <Link href="/messages" className="flex items-center gap-2 py-2.5 px-2 rounded-lg hover:bg-gray-50" onClick={closeMobileMenu}>
                  <MessageSquare size={18} className="text-gray-500" />
                  메시지
                </Link>
                <Link href="/mypage?tab=wishlists" className="flex items-center gap-2 py-2.5 px-2 rounded-lg hover:bg-gray-50" onClick={closeMobileMenu}>
                  <Heart size={18} className="text-gray-500" />
                  위시리스트
                </Link>
                <Link href="/mypage?tab=reservations" className="flex items-center gap-2 py-2.5 px-2 rounded-lg hover:bg-gray-50" onClick={closeMobileMenu}>
                  <CalendarDays size={18} className="text-gray-500" />
                  예약 내역
                </Link>
                {(user?.role === 'host' || user?.role === 'admin') && (
                  <Link href="/host" className="flex items-center gap-2 py-2.5 px-2 rounded-lg hover:bg-gray-50" onClick={closeMobileMenu}>
                    <LayoutDashboard size={18} className="text-gray-500" />
                    호스트 대시보드
                  </Link>
                )}
                {user?.role === 'admin' && (
                  <Link href="/admin" className="flex items-center gap-2 py-2.5 px-2 rounded-lg hover:bg-gray-50" onClick={closeMobileMenu}>
                    <LayoutDashboard size={18} className="text-gray-500" />
                    관리자
                  </Link>
                )}
                <button
                  className="flex items-center gap-2 py-2.5 px-2 rounded-lg hover:bg-gray-50 w-full text-left text-red-500"
                  onClick={() => { signOut({ callbackUrl: '/' }); closeMobileMenu(); }}
                >
                  <LogOut size={18} />
                  로그아웃
                </button>
              </>
            ) : (
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1" onClick={closeMobileMenu}>
                  <Button variant="outline" className="w-full">로그인</Button>
                </Link>
                <Link href="/signup" className="flex-1" onClick={closeMobileMenu}>
                  <Button className="w-full">회원가입</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
