import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminAccessToken } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const responseError = (message: string, status: number) =>
  NextResponse.json({ error: message }, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  });

function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get('origin');
  return Boolean(origin && origin === request.nextUrl.origin);
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return responseError('Request origin rejected.', 403);
  if (!(request.headers.get('content-type') || '').includes('application/json')) {
    return responseError('Expected JSON request.', 415);
  }
  const length = Number(request.headers.get('content-length') || 0);
  if (!Number.isFinite(length) || length < 0 || length > 10000) {
    return responseError('Request is too large.', 413);
  }
  const data: unknown = await request.json().catch(() => null);
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return responseError('Valid sign-in required.', 400);
  }
  const token = (data as { access_token?: unknown }).access_token;
  if (typeof token !== 'string' || token.length < 30 || token.length > 8192 ||
      !/^[A-Za-z0-9._~-]+$/.test(token)) {
    return responseError('Valid sign-in required.', 401);
  }

  const admin = await verifyAdminAccessToken(token);
  if (!admin) return responseError('Administrator access required.', 403);

  const response = NextResponse.json({ ok: true }, {
    headers: { 'Cache-Control': 'no-store' },
  });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 30,
  });
  return response;
}

export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return responseError('Request origin rejected.', 403);
  const response = NextResponse.json({ ok: true }, {
    headers: { 'Cache-Control': 'no-store' },
  });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}
