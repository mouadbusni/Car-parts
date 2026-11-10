// Alternative TypeScript entry for initial, owner-authorized admin provisioning.
// Use the same strictly environment-provided credentials as scripts/create-admin.js.
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL?.trim();
const adminPassword = process.env.ADMIN_PASSWORD;

function strongPassword(value: string): boolean {
  return value.length >= 16 &&
    /[A-Z]/.test(value) &&
    /[a-z]/.test(value) &&
    /[0-9]/.test(value) &&
    /[^A-Za-z0-9]/.test(value);
}

async function createAdminUser(): Promise<void> {
  if (!supabaseUrl || !serviceRoleKey || !adminEmail ||
      !adminPassword || !strongPassword(adminPassword)) {
    throw new Error('Missing secure admin provisioning configuration. See ADMIN_SETUP.md.');
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    app_metadata: { role: 'admin' },
  });

  if (error) throw new Error('Failed to provision an administrator: ' + error.message);
  console.log('Admin provisioning completed. User ID:', data.user?.id);
  // Do not log passwords, access tokens, private keys or user sessions.
}

void createAdminUser().catch(() => {
  console.error('Admin provisioning failed. Check server configuration and account state.');
  process.exitCode = 1;
});
