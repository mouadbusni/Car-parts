import { createClient } from '@supabase/supabase-js';

export const ADMIN_SESSION_COOKIE = 'autopro-admin-session';

export type VerifiedAdmin = {
  id: string;
  email: string | undefined;
};

// Verify authorization with Supabase Auth, not user-editable cookies or user_metadata.
// An administrator must have app_metadata.role='admin', set only by a trusted server admin.
export async function verifyAdminAccessToken(token: string): Promise<VerifiedAdmin | null> {
  if (!token || token.length > 8192) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  try {
    const verifier = createClient(url, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    });
    const { data, error } = await verifier.auth.getUser(token);
    if (error || !data.user || data.user.app_metadata?.role !== 'admin') return null;
    return { id: data.user.id, email: data.user.email };
  } catch {
    return null;
  }
}
