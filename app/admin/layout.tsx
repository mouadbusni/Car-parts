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

  useEffect(() => {
    let active = true;
    const checkAdmin = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        const verified = !error && data.user?.app_metadata?.role === 'admin';
        if (!active) return;
        if (verified) {
          setUser({ email: data.user?.email });
        } else {
          router.replace('/login');
        }
      } catch {
        if (active) router.replace('/login');
      } finally {
        if (active) setLoading(false);
      }
    };
    void checkAdmin();
    return () => { active = false; };
  }, [router]);

  const handleLogout = async () => {
    // Clear the server-issued HttpOnly session even if Supabase sign-out fails.
    await fetch('/api/admin-session', { method: 'DELETE', credentials: 'same-origin' }).catch(() => null);
    await supabase.auth.signOut().catch(() => null);
    setUser(null);
    router.replace('/login');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

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