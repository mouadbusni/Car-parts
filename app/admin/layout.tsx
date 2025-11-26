'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { LogOut, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const getCookieUser = () => {
    if (typeof document === 'undefined') return null;
    const entry = document.cookie.split('; ').find((value) => value.startsWith('sb-auth-token='));
    if (!entry) return null;
    try {
      const payload = JSON.parse(decodeURIComponent(entry.split('=')[1]));
      if (payload?.email) {
        return { email: payload.email };
      }
    } catch {
      return null;
    }
    return null;
  };

  useEffect(() => {
    const hydrateUser = async () => {
      const cookieUser = getCookieUser();
      if (cookieUser) {
        setUser(cookieUser);
        setLoading(false);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          setLoading(false);
          return;
        }
      } catch {}

      const fallbackUser = getCookieUser();
      if (fallbackUser) {
        setUser(fallbackUser);
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    hydrateUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    if (typeof window !== 'undefined') {
      document.cookie = 'sb-auth-token=; path=/; max-age=0; SameSite=Lax';
      document.cookie = 'admin-product-local-store=; path=/; max-age=0; SameSite=Lax';
    }
    setUser(null);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className={`${sidebarOpen ? 'w-64' : 'w-0'} relative flex flex-col bg-white shadow-lg transition-all duration-300 overflow-hidden`}>
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li><Link href="/admin" className="block p-2 rounded hover:bg-gray-200 text-gray-700">Dashboard</Link></li>
            <li><Link href="/admin/products" className="block p-2 rounded hover:bg-gray-200 text-gray-700">Products</Link></li>
            <li><a href="/admin/orders" className="block p-2 rounded hover:bg-gray-200 text-gray-700">Orders</a></li>
            <li><a href="/admin/customers" className="block p-2 rounded hover:bg-gray-200 text-gray-700">Customers</a></li>
            <li><a href="/admin/content" className="block p-2 rounded hover:bg-gray-200 text-gray-700">Content</a></li>
            <li><a href="/admin/analytics" className="block p-2 rounded hover:bg-gray-200 text-gray-700">Analytics</a></li>
            <li><a href="/admin/settings" className="block p-2 rounded hover:bg-gray-200 text-gray-700">Settings</a></li>
          </ul>
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-white">
          <div className="text-sm text-gray-600 mb-3">
            <p className="font-semibold">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white shadow p-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600 hover:text-gray-900"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div className="text-gray-600 text-sm">Welcome, {user?.email}</div>
        </div>
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
}