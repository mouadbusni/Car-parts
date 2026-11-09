'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Grid, List, Star, ShoppingCart } from 'lucide-react';
import { supabase, Product, Category } from '@/lib/supabase';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Link from 'next/link';
import { addToCart } from '@/lib/cart-store';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchReady, setSearchReady] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [cartNotice, setCartNotice] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Read the landing-page search after hydration; do not fetch unfiltered results first.
    const initialSearch = new URLSearchParams(window.location.search).get('search') || '';
    setSearchQuery(initialSearch.trim().slice(0, 120));
    setSearchReady(true);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError('');

    const { data: categoriesData } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (categoriesData) setCategories(categoriesData);

    let query = supabase.from('products').select('*');

    if (selectedCategory !== 'all') {
      const category = categoriesData?.find((c) => c.slug === selectedCategory);
      if (category) {
        query = query.eq('category_id', category.id);
      }
    }

    if (searchQuery) {
      query = query.ilike('name', `%${searchQuery}%`);
    }

    if (sortBy === 'featured') {
      query = query.order('is_featured', { ascending: false }).order('rating', { ascending: false });
    } else if (sortBy === 'price-low') {
      query = query.order('price', { ascending: true });
    } else if (sortBy === 'price-high') {
      query = query.order('price', { ascending: false });
    } else if (sortBy === 'rating') {
      query = query.order('rating', { ascending: false });
    }

    const { data: productsData, error: productsError } = await query;

    if (productsError) {
      setProducts([]);
      setLoadError('Unable to load products. Please retry.');
    } else {
      setProducts(productsData || []);
    }
    setLoading(false);
  }, [selectedCategory, sortBy, searchQuery]);

  useEffect(() => {
    if (searchReady) loadData();
  }, [loadData, searchReady]);

  return (
    <main className="min-h-screen bg-black">
      <Header />

      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Performance Parts Catalog
            </h1>
            <p className="text-xl text-neutral-400 mb-8">
              Browse our complete selection of premium automotive components
            </p>

            <div className="flex flex-col lg:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <Input
                  type="search"
                  aria-label="Search products by name"
                  placeholder="Search parts by product name..."
                  maxLength={120}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-neutral-900 border-neutral-800 text-white placeholder:text-neutral-500"
                />
              </div>

              <div className="flex gap-3">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 h-12 bg-neutral-900 border-neutral-800 text-white">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800">
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.slug}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48 h-12 bg-neutral-900 border-neutral-800 text-white">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Top Rated</SelectItem>
                  </SelectContent>
                </Select>

                <div className="hidden md:flex gap-2 border border-neutral-800 rounded-lg p-1 bg-neutral-900">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode('grid')}
                    className={viewMode === 'grid' ? 'bg-neutral-800' : ''}
                  >
                    <Grid className="w-5 h-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setViewMode('list')}
                    className={viewMode === 'list' ? 'bg-neutral-800' : ''}
                  >
                    <List className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <div className="text-neutral-400">
                {loading ? 'Loading...' : `${products.length} products found`}
              </div>
            </div>
          </motion.div>

          {cartNotice && (
            <div role="status" aria-live="polite" className="mb-5 rounded-lg border border-orange-700/40 bg-orange-900/20 px-4 py-3 text-sm text-orange-200">
              {cartNotice} {cartNotice.startsWith('Added') && <Link href="/cart" className="ml-2 font-semibold underline">View cart</Link>}
            </div>
          )}
          {loadError && !loading && (
            <div role="alert" className="mb-6 rounded-lg border border-orange-600/40 bg-orange-600/10 p-4 text-orange-100">
              {loadError} <button type="button" className="underline underline-offset-4" onClick={loadData}>Retry</button>
            </div>
          )}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 bg-neutral-900 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'flex flex-col gap-4'
              }
            >
              {products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <div
                      className={`group bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-orange-600/50 transition-all duration-300 ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                    >
                      <Link
                        href={`/products/${product.slug}`}
                        aria-label={`View ${product.name}`}
                        className={`relative block overflow-hidden bg-neutral-950 ${
                          viewMode === 'list' ? 'w-36 shrink-0 sm:w-64' : 'h-64'
                        }`}
                      >
                        <div
                          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                          style={{ backgroundImage: `url(${product.image_url})` }}
                        />
                        {product.compare_price && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-orange-600 text-white">SALE</Badge>
                          </div>
                        )}
                      </Link>

                      <div className="p-6 flex-1">
                        <Badge variant="outline" className="text-neutral-400 border-neutral-700 mb-2">
                          {product.brand}
                        </Badge>

                        <Link href={`/products/${product.slug}`} className="block">
                          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">
                            {product.name}
                          </h3>
                        </Link>

                        <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex items-center gap-2 mb-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                            <span className="text-white font-semibold">{product.rating}</span>
                          </div>
                          <span className="text-neutral-500 text-sm">
                            ({product.reviews_count})
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            {product.compare_price && (
                              <div className="text-neutral-500 line-through text-sm">
                                ${product.compare_price.toFixed(2)}
                              </div>
                            )}
                            <div className="text-2xl font-bold text-white">
                              ${product.price.toFixed(2)}
                            </div>
                          </div>

                          <Button type="button" disabled={product.stock_quantity <= 0} onClick={() => {
                            const result = addToCart(product, 1);
                            setCartNotice(result.ok ? `Added ${product.name} to your cart.` : result.reason);
                          }} className="bg-orange-600 hover:bg-orange-700 text-white disabled:cursor-not-allowed disabled:opacity-40" size="sm">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                </motion.div>
              ))}
            </div>
          )}

          {!loading && !loadError && products.length === 0 && (
            <div className="text-center py-16">
              <p className="text-neutral-400 text-lg mb-4">No products found</p>
              <Button onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
