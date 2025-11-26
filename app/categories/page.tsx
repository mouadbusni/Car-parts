'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { supabase, Category } from '@/lib/supabase';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data);
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-black">
      <Header />

      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <p className="text-orange-500 uppercase tracking-[0.4em] text-sm mb-4">Categories</p>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Performance Parts Ecosystem
            </h1>
            <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
              Dive deeper into every segment of our catalog with curated landing pages that highlight key specs,
              imagery, and featured builds for each discipline.
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 rounded-2xl bg-neutral-900 border border-neutral-800 animate-pulse" />
              ))}
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Link href={`/categories/${category.slug}`}>
                    <div className="group relative h-80 overflow-hidden rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-orange-600/50 transition-all duration-500">
                      <div
                        className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                        style={{ backgroundImage: `url(${category.image_url})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />
                      <div className="relative h-full flex flex-col justify-between p-6">
                        <div>
                          <p className="text-sm text-neutral-400 uppercase tracking-[0.3em] mb-3">
                            Category Spotlight
                          </p>
                          <h2 className="text-3xl font-bold text-white mb-3 group-hover:text-orange-500 transition-colors">
                            {category.name}
                          </h2>
                          <p className="text-neutral-300 line-clamp-3">{category.description}</p>
                        </div>
                        <div className="flex items-center justify-between text-orange-500 font-semibold">
                          <span>View Details</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-neutral-400 text-lg mb-4">Categories are not available right now.</p>
              <Link href="/products">
                <Button>Browse Products</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
