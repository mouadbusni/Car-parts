'use client';

import { useSyncExternalStore } from 'react';
import type { Product } from '@/lib/supabase';

// This is a browser-local shopping list, NOT an order or checkout authority.
// Product price/stock must be revalidated on the server before a future checkout.
const STORAGE_KEY = 'autopro:cart:v1';
const MAX_QUANTITY = 99;
const EMPTY: CartLine[] = [];
const subscribers = new Set<() => void>();

export interface CartLine {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
  stockAtAdd: number;
}

export type CartResult = { ok: true; quantity: number } | { ok: false; reason: string };

let snapshot: CartLine[] = EMPTY;
let hydrated = false;

function isLine(value: unknown): value is CartLine {
  if (!value || typeof value !== 'object') return false;
  const line = value as Record<string, unknown>;
  return (
    typeof line.productId === 'string' && line.productId.length > 0 && line.productId.length < 150 &&
    typeof line.slug === 'string' && line.slug.length > 0 && line.slug.length < 150 &&
    typeof line.name === 'string' && line.name.length > 0 && line.name.length < 250 &&
    typeof line.brand === 'string' && line.brand.length < 150 &&
    typeof line.imageUrl === 'string' && line.imageUrl.length < 1500 &&
    typeof line.unitPrice === 'number' && Number.isFinite(line.unitPrice) && line.unitPrice >= 0 &&
    typeof line.quantity === 'number' && Number.isInteger(line.quantity) && line.quantity >= 1 && line.quantity <= MAX_QUANTITY &&
    typeof line.stockAtAdd === 'number' && Number.isInteger(line.stockAtAdd) &&
    line.stockAtAdd >= 1 && line.stockAtAdd <= 1000000 &&
    line.quantity <= line.stockAtAdd
  );
}

function readStoredCart(): CartLine[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw || raw.length > 300000) return EMPTY;
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return EMPTY;
    const seen = new Set<string>();
    return value.filter((item): item is CartLine => {
      if (!isLine(item) || seen.has(item.productId)) return false;
      seen.add(item.productId);
      return true;
    }).slice(0, 100);
  } catch {
    // Browsers with disabled local storage should still allow in-memory browsing.
    return EMPTY;
  }
}

function hydrate() {
  if (hydrated || typeof window === 'undefined') return;
  hydrated = true;
  snapshot = readStoredCart();
}

function broadcast() {
  for (const listener of subscribers) listener();
}

function subscribe(listener: () => void) {
  hydrate();
  subscribers.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    snapshot = readStoredCart();
    broadcast();
  };
  window.addEventListener('storage', onStorage);
  return () => {
    subscribers.delete(listener);
    window.removeEventListener('storage', onStorage);
  };
}

function getSnapshot() {
  hydrate();
  return snapshot;
}

function getServerSnapshot(): CartLine[] {
  return EMPTY;
}

export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function commit(next: CartLine[]) {
  snapshot = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // In-memory state still works in private browsing or restricted contexts.
  }
  broadcast();
}

export function cartItemCount(lines: readonly CartLine[]): number {
  return lines.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartSubtotal(lines: readonly CartLine[]): number {
  return lines.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}

export function addToCart(product: Product, quantity = 1): CartResult {
  if (typeof window === 'undefined') return { ok: false, reason: 'Cart is available in the browser only.' };
  hydrate();
  if (!product.id || !product.slug || !Number.isFinite(product.price) || product.price < 0) {
    return { ok: false, reason: 'This product cannot be added right now.' };
  }
  const available = Math.floor(Number(product.stock_quantity));
  if (!Number.isFinite(available) || available < 1) {
    return { ok: false, reason: 'This product is out of stock.' };
  }
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
    return { ok: false, reason: 'Choose a valid quantity.' };
  }
  const current = snapshot.find(line => line.productId === product.id);
  const maxAllowed = Math.min(available, MAX_QUANTITY);
  const nextQuantity = (current?.quantity ?? 0) + quantity;
  if (nextQuantity > maxAllowed) {
    return { ok: false, reason: `Only ${maxAllowed} units are available for this item.` };
  }
  const line: CartLine = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    brand: product.brand || '',
    imageUrl: product.image_url || '',
    unitPrice: product.price,
    quantity: nextQuantity,
    stockAtAdd: maxAllowed,
  };
  commit(current ? snapshot.map(item => item.productId === product.id ? line : item) : [...snapshot, line]);
  return { ok: true, quantity: nextQuantity };
}

export function setCartQuantity(productId: string, quantity: number): CartResult {
  if (typeof window === 'undefined') return { ok: false, reason: 'Cart is available in the browser only.' };
  hydrate();
  const item = snapshot.find(line => line.productId === productId);
  if (!item) return { ok: false, reason: 'Item is no longer in your cart.' };
  if (!Number.isInteger(quantity) || quantity < 0) return { ok: false, reason: 'Choose a valid quantity.' };
  if (quantity === 0) {
    commit(snapshot.filter(line => line.productId !== productId));
    return { ok: true, quantity: 0 };
  }
  if (quantity > Math.min(item.stockAtAdd, MAX_QUANTITY)) {
    return { ok: false, reason: 'The selected quantity exceeds available stock at the time of adding.' };
  }
  commit(snapshot.map(line => line.productId === productId ? { ...line, quantity } : line));
  return { ok: true, quantity };
}

export function removeFromCart(productId: string) {
  if (typeof window === 'undefined') return;
  hydrate();
  if (snapshot.some(line => line.productId === productId)) {
    commit(snapshot.filter(line => line.productId !== productId));
  }
}
