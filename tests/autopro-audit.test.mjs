import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const hero = readFileSync(new URL('components/hero-section.tsx', root), 'utf8');
const catalog = readFileSync(new URL('app/products/page.tsx', root), 'utf8');
const header = readFileSync(new URL('components/header.tsx', root), 'utf8');

test('homepage search submits the product name to the catalog URL', () => {
  assert.match(hero, /<form role="search" onSubmit={submitSearch}/);
  assert.match(hero, /event\.preventDefault\(\)/);
  assert.match(hero, /encodeURIComponent\(search\)/);
  assert.match(hero, /\?search=/);
  assert.match(hero, /router\.push\(/);
  assert.match(hero, /maxLength={120}/);
  assert.match(hero, /type="submit"/);
});

test('catalog initializes its search from the URL before querying Supabase', () => {
  assert.match(catalog, /new URLSearchParams\(window\.location\.search\)\.get\('search'\)/);
  assert.match(catalog, /setSearchReady\(true\)/);
  assert.match(catalog, /if \(searchReady\) loadData\(\)/);
  assert.match(catalog, /query\.ilike\('name',/);
  assert.match(catalog, /aria-label="Search products by name"/);
});

test('no unsupported VIN functionality or performance statistics are advertised', () => {
  assert.doesNotMatch(hero, /VIN\.\.\.|150K\+|100%|24\/7/);
  assert.match(hero, /Search auto parts by product name/);
  assert.match(hero, /Find products by name/);
});

test('header scroll observer has a cleanup and mobile menu is accessible', () => {
  assert.match(header, /useEffect\(\(\) => \{/);
  assert.match(header, /window\.addEventListener\('scroll', syncScroll, \{ passive: true \}\)/);
  assert.match(header, /window\.removeEventListener\('scroll', syncScroll\)/);
  assert.match(header, /aria-expanded={isMenuOpen}/);
  assert.match(header, /aria-controls="autopro-mobile-menu"/);
  assert.match(header, /aria-label="Mobile navigation"/);
  assert.doesNotMatch(header, /href=\{`\/\$\{item\.toLowerCase\(\)\}`\}/);
});
