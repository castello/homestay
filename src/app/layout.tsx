import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/providers/session-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { MobileNav } from '@/components/layout/mobile-nav';
import { Toaster } from '@/components/ui/sonner';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '홈스테이 - 특별한 숙소를 찾아보세요',
  description: '한국의 다양한 숙소를 검색하고 예약하세요. 아파트, 한옥, 펜션, 게스트하우스 등',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
        <SessionProvider>
          <QueryProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <MobileNav />
            <Toaster />
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
