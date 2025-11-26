'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, ShoppingCart, Star } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase, Category, Product } from '@/lib/supabase';

export default function CategoryDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    async function load() {
      setLoading(true);
      const { data: categoryData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!isActive) return;

      if (!categoryData) {
        setCategory(null);
        setProducts([]);
        setLoading(false);
        return;
      }

      setCategory(categoryData);

      const { data: productsData } = await supabase
        .from('products')
        .select('*')
        .eq('category_id', categoryData.id)
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (!isActive) return;

      setProducts(productsData ?? []);
      setLoading(false);
    }

    load();

    return () => {
      isActive = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black">
        <Header />
        <div className="pt-32 flex items-center justify-center min-h-screen">
          <div className="text-white">Loading...</div>
        </div>
      </main>
    );
  }

  if (!category) {
    return (
      <main className="min-h-screen bg-black">
        <Header />
        <div className="pt-32 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Category Not Found</h1>
            <Link href="/categories">
              <Button>Back to Categories</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black">
      <Header />

      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            All Categories
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl border border-neutral-800 h-[420px] mb-16"
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${category.image_url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
            <div className="relative z-10 h-full flex flex-col justify-between p-10">
              <div className="max-w-2xl">
                <Badge variant="outline" className="border-neutral-700 text-neutral-200 mb-4">
                  Performance Category
                </Badge>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">{category.name}</h1>
                <p className="text-lg text-neutral-300 leading-relaxed">
                  {category.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-8 text-neutral-300">
                <div>
                  <div className="text-4xl font-bold text-white">{products.length}</div>
                  <p className="uppercase tracking-[0.4em] text-xs text-neutral-500">Products</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white">24/7</div>
                  <p className="uppercase tracking-[0.4em] text-xs text-neutral-500">Support</p>
                </div>
                <div>
                  <div className="text-4xl font-bold text-white">Premium</div>
                  <p className="uppercase tracking-[0.4em] text-xs text-neutral-500">Quality</p>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Featured Products</h2>
              <p className="text-neutral-400">
                {products.length > 0
                  ? 'Hand-picked upgrades engineered for peak performance.'
                  : 'We are curating the best products for this category.'}
              </p>
            </div>
            <Link
              href={`/products?category=${category.slug}`}
              className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 font-semibold"
            >
              View Catalog
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                >
                  <Link href={`/products/${product.slug}`}>
                    <div className="group bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-red-600/50 transition-all duration-300">
                      <div className="relative h-56 overflow-hidden">
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url(${product.image_url})` }}
                        />
                        {product.compare_price && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-red-600 text-white">SALE</Badge>
                          </div>
                        )}
                      </div>
                      <div className="p-6">
                        <Badge variant="outline" className="border-neutral-700 text-neutral-400 mb-3">
                          {product.brand}
                        </Badge>
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex items-center gap-2 mb-4">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-white font-semibold">{product.rating}</span>
                          <span className="text-neutral-500 text-sm">
                            ({product.reviews_count})
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            {product.compare_price && (
                              <div className="text-sm text-neutral-500 line-through">
                                ${product.compare_price.toFixed(2)}
                              </div>
                            )}
                            <div className="text-2xl font-bold text-white">
                              ${product.price.toFixed(2)}
                            </div>
                          </div>
                          <Button variant="ghost" className="text-red-500 hover:bg-red-500/10">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Quick View
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-neutral-400 text-lg mb-4">
                There are no products published for this category yet.
              </p>
              <Link href="/products">
                <Button>Browse Catalog</Button>
              </Link>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
