# Admin Account Setup

## Quick Start

### Admin Credentials
- **Email**: admin@admin.com
- **Password**: 123456

## Creating the Admin Account

### Option 1: Using Seed Script (Recommended)

1. **Get your Supabase Service Role Key**:
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy your `service_role` key (keep this secret!)

2. **Add to `.env.local`** (create this file if it doesn't exist):
   ```
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Run the seed script**:
   ```bash
   npm run seed:admin
   ```
   
   Expected output:
   ```
   Creating admin user...
   ✅ Admin user created successfully!
   Email: admin@admin.com
   Password: 123456
   ```

### Option 2: Manual Setup via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Users
3. Click "Add user"
4. Enter:
   - Email: `admin@admin.com`
   - Password: `123456`
5. Confirm email
6. Save

## Testing the Admin Login

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Navigate to http://localhost:3000/login

3. Enter credentials:
   - Email: `admin@admin.com`
   - Password: `123456`
   - Role: Select "Admin"

4. Click "Sign In" - you should be redirected to the admin dashboard

## Running Tests

```bash
npm test
```

Or with UI:
```bash
npm run test:ui
```

## Notes

- The admin account will have full access to `/admin/*` routes
- All other routes (`/admin/*`) are protected and require authentication
- Without authentication, users are redirected to the login page
