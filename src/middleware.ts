import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isLoggedIn = !!token;
  const userRole = token?.role as string | undefined;

  const protectedPaths = ['/mypage', '/host', '/messages', '/booking'];
  const adminPaths = ['/admin'];
  const authPaths = ['/login', '/signup'];

  if (authPaths.some(p => pathname.startsWith(p)) && isLoggedIn) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (protectedPaths.some(p => pathname.startsWith(p)) && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, request.url));
  }

  if (adminPaths.some(p => pathname.startsWith(p)) && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|uploads).*)'],
};
