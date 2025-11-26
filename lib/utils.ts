import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Product } from './supabase';

const LOCAL_PRODUCTS_KEY = 'admin-product-local-store';

type LocalMode = 'new' | 'override';

export type LocalProductEntry = {
  id: string;
  mode: LocalMode;
  data: Partial<Product>;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getCookieValue = (key: string) => {
  if (typeof document === 'undefined') return '';
  const entry = document.cookie.split('; ').find((value) => value.startsWith(`${key}=`));
  return entry ? entry.substring(key.length + 1) : '';
};

const writeCookie = (key: string, value: string) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${key}=${value}; path=/; SameSite=Lax`;
};

export function readLocalProductEntries(): LocalProductEntry[] {
  try {
    const raw = getCookieValue(LOCAL_PRODUCTS_KEY);
    return raw ? JSON.parse(decodeURIComponent(raw)) : [];
  } catch {
    return [];
  }
}

export function upsertLocalProductEntry(entry: LocalProductEntry) {
  const entries = readLocalProductEntries().filter((item) => !(item.id === entry.id && item.mode === entry.mode));
  entries.push(entry);
  writeCookie(LOCAL_PRODUCTS_KEY, encodeURIComponent(JSON.stringify(entries)));
}
