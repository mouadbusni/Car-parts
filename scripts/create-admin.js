const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    const { data, error } = await supabase.auth.admin.createUser({
      email: 'admin@admin.com',
      password: '123456',
      email_confirm: true,
    });

    if (error) {
      console.error('Error creating admin user:', error.message);
      if (error.message.includes('already exists')) {
        console.log('ℹ️  Admin user already exists');
        console.log('Email: admin@admin.com');
        console.log('Password: 123456');
      }
      process.exit(1);
    }

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@admin.com');
    console.log('Password: 123456');
    process.exit(0);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

createAdminUser();
