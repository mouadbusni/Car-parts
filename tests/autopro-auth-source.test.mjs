import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const file = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const login = file('app/login/page.tsx');
const layout = file('app/admin/layout.tsx');
const middleware = file('middleware.ts');
const auth = file('lib/admin-auth.ts');
const route = file('app/api/admin-session/route.ts');
const seed = file('scripts/create-admin.js');
const instructions = file('ADMIN_SETUP.md');

test('no default administrator credential or sign-in bypass exists', () => {
  for (const code of [login,layout,seed]) {
    assert.doesNotMatch(code, /DEFAULT_ADMIN_EMAIL|DEFAULT_ADMIN_PASSWORD/);
    assert.doesNotMatch(code, /admin@admin\.com|123456/);
    assert.doesNotMatch(code, /getCookieUser|sb-auth-token/);
  }
  assert.match(login, /supabase\.auth\.signInWithPassword\(credentials\)/);
  assert.match(login, /fetch\('\/api\/admin-session'/);
});

test('server must verify token with Supabase Auth and trusted app_metadata role', () => {
  assert.match(auth, /verifier\.auth\.getUser\(token\)/);
  assert.match(auth, /data\.user\.app_metadata\?\.role !== 'admin'/);
  assert.doesNotMatch(auth, /user_metadata\?\.role/);
  assert.match(route, /verifyAdminAccessToken\(token\)/);
  assert.match(route, /httpOnly: true/);
  assert.match(route, /sameSite: 'lax'/);
  assert.match(middleware, /verifyAdminAccessToken\(token\)/);
  assert.match(middleware, /\['\/admin\/:path\*', '\/dashboard\/:path\*'\]/);
  assert.doesNotMatch(middleware, /!authToken &&/);
});

test('admin layout does not trust email-only cookies and clears HttpOnly session on logout', () => {
  assert.match(layout, /supabase\.auth\.getUser\(\)/);
  assert.match(layout, /data\.user\?\.app_metadata\?\.role === 'admin'/);
  assert.match(layout, /fetch\('\/api\/admin-session', \{ method: 'DELETE'/);
  assert.doesNotMatch(layout, /document\.cookie/);
});

test('admin provisioning requires a real owner password and trusted role', () => {
  assert.match(seed, /process\.env\.ADMIN_EMAIL/);
  assert.match(seed, /process\.env\.ADMIN_PASSWORD/);
  assert.match(seed, /adminPassword\.length < 16/);
  assert.match(seed, /app_metadata: \{ role: 'admin' \}/);
  assert.doesNotMatch(seed, /console\.log\('Password:/);
  assert.match(instructions, /rotate that password/i);
});
