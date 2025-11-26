import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default async function AdminDashboard() {
  const { data: products } = await supabase.from('products').select('id').limit(1);
  
  let orders = [];
  try {
    const result = await supabase.from('orders').select('id').limit(1);
    orders = result.data || [];
  } catch {
    orders = [];
  }
  
  const { data: categories } = await supabase.from('categories').select('id').limit(1);

  const stats = [
    {
      title: 'Products',
      value: products?.length || 0,
      href: '/admin/products',
      color: 'bg-blue-500',
    },
    {
      title: 'Orders',
      value: orders.length || 0,
      href: '/admin/orders',
      color: 'bg-green-500',
    },
    {
      title: 'Categories',
      value: categories?.length || 0,
      href: '/admin/content',
      color: 'bg-purple-500',
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`${stat.color} w-12 h-12 rounded-lg`} />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <Link href="/admin/products/new" className="block p-3 bg-blue-50 rounded hover:bg-blue-100 text-blue-700 font-medium">
              + Add New Product
            </Link>
            <Link href="/admin/products" className="block p-3 bg-gray-50 rounded hover:bg-gray-100 text-gray-700 font-medium">
              View All Products
            </Link>
            <Link href="/admin/settings" className="block p-3 bg-gray-50 rounded hover:bg-gray-100 text-gray-700 font-medium">
              Go to Settings
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">System Info</h2>
          <div className="space-y-3 text-sm text-gray-600">
            <p>
              <span className="font-semibold text-gray-900">Admin Status:</span> Active
            </p>
            <p>
              <span className="font-semibold text-gray-900">Database:</span> Connected
            </p>
            <p>
              <span className="font-semibold text-gray-900">Version:</span> 1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
