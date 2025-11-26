import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image_url: string;
  created_at: string;
};

export type Product = {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price: number | null;
  image_url: string;
  gallery: string[];
  specifications: Record<string, string>;
  compatibility: string[];
  stock_quantity: number;
  sku: string;
  brand: string;
  rating: number;
  reviews_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
};

export type CartItem = {
  id: string;
  user_id: string;
  product_id: string;
  quantity: number;
  product?: Product;
};
