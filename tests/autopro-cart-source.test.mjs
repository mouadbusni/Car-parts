import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const store = read('lib/cart-store.ts');
const cart = read('app/cart/page.tsx');
const header = read('components/header.tsx');
const listing = read('app/products/page.tsx');
const detail = read('app/products/[slug]/page.tsx');
const featured = read('components/featured-products.tsx');

test('cart is browser-local and validates persisted items before use', () => {
  assert.match(store, /autopro:cart:v1/);
  assert.match(store, /function isLine/);
  assert.match(store, /Number\.isFinite\(line\.unitPrice\)/);
  assert.match(store, /Number\.isInteger\(line\.quantity\)/);
  assert.match(store, /JSON\.parse\(raw\)/);
  assert.match(store, /useSyncExternalStore\(/);
  assert.match(store, /window\.addEventListener\('storage'/);
  assert.match(store, /window\.removeEventListener\('storage'/);
});

test('cart supports shared product items, quantities, totals, removal, and invalid stock', () => {
  for (const functionName of ['addToCart','setCartQuantity','removeFromCart','cartItemCount','cartSubtotal']) {
    assert.ok(store.includes('function ' + functionName), 'Missing ' + functionName);
  }
  assert.match(store, /available < 1/);
  assert.match(store, /nextQuantity > maxAllowed/);
  assert.match(store, /snapshot\.filter\(line => line\.productId !== productId\)/);
  assert.match(cart, /data-testid="cart-product"/);
  assert.match(cart, /data-testid="cart-subtotal"/);
  assert.match(cart, /data-testid="cart-item-count"/);
  assert.match(cart, /disabled aria-describedby="autopro-checkout-note"/);
  assert.match(cart, /Orders and payments are not enabled/);
  assert.doesNotMatch(cart, /Proceed to Checkout|Free shipping on orders over/);
});

test('all product Add controls are independent of navigation links', () => {
  for (const source of [listing, detail, featured]) {
    assert.match(source, /addToCart\(product,/);
    assert.match(source, /disabled=\{product\.stock_quantity <= 0\}/);
  }
  assert.doesNotMatch(listing, /<Link href=\{\x60\/products\/\$\{product\.slug\}\x60\}>\s*<div\s+className=/);
  assert.doesNotMatch(featured, /<Link href=\{\x60\/products\/\$\{product\.slug\}\x60\}>\s*<div/);
  assert.match(header, /data-testid="header-cart-count"/);
  assert.match(header, /cartItemCount\(useCart\(\)\)/);
});
