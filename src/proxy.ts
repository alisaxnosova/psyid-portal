import { NextRequest, NextResponse } from 'next/server';

const AUTH_ONLY = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // JWT is stored in localStorage (client-side only), so we can't check it in middleware.
  // Instead, use a server cookie that mirrors auth state.
  const hasSession = request.cookies.has('reno_session');

  const isAuthPage = AUTH_ONLY.some(p => pathname.startsWith(p));

  // Logged-in users hitting login/register go straight to their portal.
  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL('/portal', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/register'],
};
