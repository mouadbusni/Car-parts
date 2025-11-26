'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase, type Product } from '@/lib/supabase';
import { readLocalProductEntries, type LocalProductEntry } from '@/lib/utils';

const buildProduct = (payload: Partial<Product>): Product => {
  const fallbackId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`;
  return {
    id: payload.id ?? fallbackId,
    category_id: payload.category_id ?? '',
    name: payload.name ?? 'Untitled Product',
    slug: payload.slug ?? (payload.id ?? fallbackId),
    description: payload.description ?? '',
    price: typeof payload.price === 'number' ? payload.price : Number(payload.price ?? 0),
    compare_price: payload.compare_price ?? null,
    image_url: payload.image_url ?? '',
    gallery: payload.gallery ?? [],
    specifications: payload.specifications ?? {},
    compatibility: payload.compatibility ?? [],
    stock_quantity: typeof payload.stock_quantity === 'number' ? payload.stock_quantity : Number(payload.stock_quantity ?? 0),
    sku: payload.sku ?? fallbackId,
    brand: payload.brand ?? '',
    rating: payload.rating ?? 0,
    reviews_count: payload.reviews_count ?? 0,
    is_featured: payload.is_featured ?? false,
    created_at: payload.created_at ?? new Date().toISOString(),
    updated_at: payload.updated_at ?? new Date().toISOString(),
  };
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const mergeProducts = (remote: Product[]) => {
      const entries = readLocalProductEntries();
      const replacements = new Map<string, Partial<Product>>();

      entries.forEach((entry: LocalProductEntry) => {
        replacements.set(entry.id, entry.data);
      });

      const merged = remote.map((product) => {
        const replacement = replacements.get(product.id);
        if (!replacement) {
          return product;
        }
        replacements.delete(product.id);
        return buildProduct({ ...product, ...replacement, id: product.id });
      });

      const additions = Array.from(replacements.entries()).map(([id, data]) => buildProduct({ ...data, id }));
      return [...merged, ...additions];
    };

    const hydrate = async () => {
      try {
        const { data } = await supabase.from('products').select('*');
        if (!mounted) return;
        setProducts(mergeProducts(((data ?? []) as Product[])));
      } catch {
        if (!mounted) return;
        setProducts(mergeProducts([]));
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Link href="/admin/products/new" className="bg-blue-500 text-white px-4 py-2 rounded">Add New Product</Link>
      </div>
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading products...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${product.price}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.stock_quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link href={`/admin/products/${product.id}/edit`} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</Link>
                    <button className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
