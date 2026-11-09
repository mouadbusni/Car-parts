const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const adminEmail = process.env.ADMIN_EMAIL?.trim();
const adminPassword = process.env.ADMIN_PASSWORD;

if (!supabaseUrl || !supabaseServiceKey || !adminEmail || !adminPassword) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL or ADMIN_PASSWORD.');
  process.exit(1);
}

if (adminPassword.length < 16 || !/[A-Z]/.test(adminPassword) ||
    !/[a-z]/.test(adminPassword) || !/[0-9]/.test(adminPassword) ||
    !/[^A-Za-z0-9]/.test(adminPassword)) {
  console.error('ADMIN_PASSWORD must contain 16+ characters including upper/lowercase, digits, and symbols.');
  process.exit(1);
}

const client = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createAdminUser() {
  try {
    const { data, error } = await client.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      app_metadata: { role: 'admin' },
    });
    if (error) {
      console.error('Unable to create administrator:', error.message);
      process.exitCode = 1;
      return;
    }
    console.log('Administrator created with trusted role. User ID:', data.user?.id);
    // Never print credentials or access tokens to workflow/log output.
  } catch {
    console.error('Administrator provisioning failed.');
    process.exitCode = 1;
  }
}

createAdminUser();
