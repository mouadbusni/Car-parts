import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@admin.com',
      password: '123456',
      email_confirm: true,
    });

    if (error) {
      console.error('Error creating admin user:', error);
      if (error.message.includes('already exists')) {
        console.log('Admin user already exists');
      }
      process.exit(1);
    }

    console.log('Admin user created successfully:', data.user?.email);
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

createAdminUser();
