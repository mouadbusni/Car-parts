import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_COOKIE, validToken, verifyAdminToken } from '@/lib/server/admin-auth';

export const runtime = 'nodejs';

const noStore = { 'Cache-Control': 'no-store' };
const responseError = (message: string, status: number) =>
  NextResponse.json({ error: message }, { status, headers: noStore });

// Never accept an administrator cookie from JavaScript or a user-supplied email.
// The browser sends its real Supabase access token once for server validation;
// the server then issues a short-lived HttpOnly host-scoped session cookie.
export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== request.nextUrl.origin) {
    return responseError('Invalid request origin.', 403);
  }
  const type = request.headers.get('content-type') || '';
  const length = Number(request.headers.get('content-length') || 0);
  if (!type.includes('application/json') || length > 10000) {
    return responseError('Invalid request content.', 400);
  }
  let token: unknown;
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return responseError('Invalid session request.', 400);
    }
    token = (body as { access_token?: unknown }).access_token;
  } catch {
    return responseError('Invalid JSON.', 400);
  }
  if (!validToken(token) || !(await verifyAdminToken(token))) {
    return responseError('Administrator authorization required.', 403);
  }
  const response = NextResponse.json({ ok: true }, { headers: noStore });
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 30 * 60,
  });
  return response;
}

// Revoke the local browser cookie, not the Supabase session itself.
export async function DELETE(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== request.nextUrl.origin) {
    return responseError('Invalid request origin.', 403);
  }
  const response = NextResponse.json({ ok: true }, { headers: noStore });
  response.cookies.set({
    name: ADMIN_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: 0,
  });
  return response;
}
