// Shared, server-only admin identity verification for the legacy Next.js app.
// This module must never use SUPABASE_SERVICE_ROLE_KEY for user verification.
const MAX_BEARER_LENGTH = 8192;

export const ADMIN_COOKIE =
  process.env.NODE_ENV === 'production'
    ? '__Host-autopro-admin'
    : 'autopro-admin-dev';

export function validToken(token: unknown): token is string {
  return typeof token === 'string' &&
    token.length >= 30 &&
    token.length <= MAX_BEARER_LENGTH &&
    /^[A-Za-z0-9._~-]+$/.test(token);
}

export async function verifyAdminToken(token: unknown): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!validToken(token) || !url || !anonKey) return false;
  try {
    const authUrl = new URL('/auth/v1/user', url);
    if (authUrl.protocol !== 'https:' && authUrl.hostname !== 'localhost' && authUrl.hostname !== '127.0.0.1') {
      return false;
    }
    const response = await fetch(authUrl.toString(), {
      method: 'GET',
      headers: {
        apikey: anonKey,
        Authorization: 'Bearer ' + token,
        Accept: 'application/json',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return false;
    const user: unknown = await response.json();
    if (!user || typeof user !== 'object') return false;
    const account = user as {
      id?: unknown;
      app_metadata?: { role?: unknown; is_admin?: unknown };
    };
    return typeof account.id === 'string' &&
      account.id.length > 0 &&
      account.app_metadata?.role === 'admin';
  } catch {
    return false;
  }
}
