import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminAccessToken } from '@/lib/admin-auth';

// A browser-editable cookie is not proof of authorization.
// Verify every protected navigation against Supabase Auth and trusted app_metadata.
export async function middleware(request: NextRequest) {
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const admin = token ? await verifyAdminAccessToken(token) : null;
  if (!admin) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.search = '';
    return NextResponse.redirect(loginUrl, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
  const response = NextResponse.next();
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
