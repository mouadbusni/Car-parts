'use client';

import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useRouter, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { readLocalProductEntries, upsertLocalProductEntry } from '@/lib/utils';

type FormData = {
  name: string;
  slug: string;
  description: string;
  price: number;
  compare_price?: number;
  category_id: string;
  stock_quantity: number;
  sku: string;
  brand: string;
  is_featured: boolean;
};

export default function EditProductPage() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>();
  const router = useRouter();
  const { id } = useParams();
  const productId = Array.isArray(id) ? id[0] : id;
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!productId) {
        setLoading(false);
        return;
      }
      const [{ data: product }, { data: cats }] = await Promise.all([
        supabase.from('products').select('*').eq('id', productId).maybeSingle(),
        supabase.from('categories').select('*'),
      ]);
      setCategories(cats || []);
      const localEntries = readLocalProductEntries();
      const localMatch = localEntries.find((entry) => entry.id === productId);
      const merged = { ...(product || {}), ...(localMatch?.data || {}) };
      const fillableKeys: (keyof FormData)[] = ['name', 'slug', 'description', 'price', 'compare_price', 'category_id', 'stock_quantity', 'sku', 'brand', 'is_featured'];
      fillableKeys.forEach((key) => {
        if (merged[key] !== undefined) {
          setValue(key, merged[key] as any);
        }
      });
      setLoading(false);
    };
    fetchData();
  }, [productId, setValue]);

  const onSubmit = async (data: FormData) => {
    if (!productId) {
      router.push('/admin/products');
      return;
    }
    const { error } = await supabase.from('products').update(data).eq('id', productId);
    const localEntries = readLocalProductEntries();
    const existing = localEntries.find((entry) => entry.id === productId);
    const mode = existing?.mode ?? 'override';
    upsertLocalProductEntry({
      id: productId,
      mode,
      data: { ...(existing?.data || {}), ...data },
    });
    if (error) {
      router.push('/admin/products');
      return;
    }
    router.push('/admin/products');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Product</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input {...register('name', { required: true })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
          {errors.name && <span className="text-red-500">Required</span>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input {...register('slug', { required: true })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea {...register('description')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input type="number" step="0.01" {...register('price', { required: true, valueAsNumber: true })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Compare Price</label>
          <input type="number" step="0.01" {...register('compare_price', { valueAsNumber: true })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select {...register('category_id')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
            <option value="">Select Category</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
          <input type="number" {...register('stock_quantity', { required: true, valueAsNumber: true })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">SKU</label>
          <input {...register('sku', { required: true })} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Brand</label>
          <input {...register('brand')} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm" />
        </div>
        <div>
          <label className="flex items-center">
            <input type="checkbox" {...register('is_featured')} className="mr-2" />
            Featured
          </label>
        </div>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Update Product</button>
      </form>
    </div>
  );
}