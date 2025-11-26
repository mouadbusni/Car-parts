'use client';

import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { upsertLocalProductEntry } from '@/lib/utils';

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

export default function NewProductPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);

  const persistLocalProduct = (data: FormData) => {
    if (typeof window === 'undefined') return;
    const fallbackId = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}`;
    upsertLocalProductEntry({
      id: fallbackId,
      mode: 'new',
      data: {
        id: fallbackId,
        name: data.name,
        slug: data.slug,
        description: data.description,
        price: data.price,
        stock_quantity: data.stock_quantity,
        sku: data.sku,
        category_id: data.category_id,
        brand: data.brand,
        is_featured: data.is_featured,
      },
    });
  };

  useEffect(() => {
    supabase.from('categories').select('*').then(({ data }) => setCategories(data || []));
  }, []);

  const onSubmit = async (data: FormData) => {
    const { error } = await supabase.from('products').insert(data);
    if (error) {
      persistLocalProduct(data);
    }
    router.push('/admin/products');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Add New Product</h1>
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
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Create Product</button>
      </form>
    </div>
  );
}