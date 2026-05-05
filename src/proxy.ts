import { NextRequest, NextResponse } from 'next/server';

const PROTECTED = ['/dashboard'];
const AUTH_ONLY = ['/login', '/register'];
const ADMIN_PROTECTED = ['/admin'];
const ADMIN_LOGIN = '/admin/login';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin routes
  if (ADMIN_PROTECTED.some(p => pathname.startsWith(p)) && pathname !== ADMIN_LOGIN) {
    const hasAdminSession = request.cookies.has('admin_session');
    if (!hasAdminSession) {
      return NextResponse.redirect(new URL(ADMIN_LOGIN, request.url));
    }
  }

  // JWT is stored in localStorage (client-side only), so we can't check it in middleware.
  // Instead, use a server cookie that mirrors auth state.
  const hasSession = request.cookies.has('reno_session');

  const isProtected = PROTECTED.some(p => pathname.startsWith(p));
  const isAuthPage = AUTH_ONLY.some(p => pathname.startsWith(p));

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/admin/:path*'],
};
