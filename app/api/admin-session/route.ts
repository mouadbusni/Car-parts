import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminAccessToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const data = await request.json().catch(() => null) as { access_token?: unknown } | null;
  const token = data?.access_token;
  if (typeof token !== 'string') {
    return NextResponse.json({ error: 'Valid sign-in required.' }, { status: 401, headers: { 'Cache-Control': 'no-store' } });
  }
  const admin = await verifyAdminAccessToken(token);
  if (!admin) {
    return NextResponse.json({ error: 'Administrator access required.' }, { status: 403, headers: { 'Cache-Control': 'no-store' } });
  }
  const result = NextResponse.json({ ok: true, email: admin.email }, { headers: { 'Cache-Control': 'no-store' } });
  result.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 30,
  });
  return result;
}

export async function DELETE() {
  const result = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } });
  result.cookies.set({ name: ADMIN_SESSION_COOKIE, value: '', httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/', maxAge: 0 });
  return result;
}
