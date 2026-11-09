'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, Star, Zap } from 'lucide-react';
import { Product } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useState } from 'react';
import { addToCart } from '@/lib/cart-store';

interface FeaturedProductsProps {
  products: Product[];
}

export default function FeaturedProducts({ products }: FeaturedProductsProps) {
  const [cartNotice, setCartNotice] = useState('');
  return (
    <section className="py-24 bg-gradient-to-b from-black to-neutral-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-block mb-4">
            <Badge className="bg-orange-600/10 text-orange-500 border-orange-600/20 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Featured Performance Parts
            </Badge>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Top Picks for Enthusiasts
          </h2>
          <p className="text-xl text-neutral-400">
            Hand-selected components that deliver race-proven performance
          </p>
        </motion.div>

        {cartNotice && (
          <div role="status" aria-live="polite" className="mx-auto mb-6 max-w-2xl rounded-lg border border-orange-800/40 bg-orange-950/20 p-3 text-center text-sm text-orange-200">
            {cartNotice} {cartNotice.startsWith('Added') && <Link href="/cart" className="ml-2 font-semibold underline">View cart</Link>}
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <div className="group relative bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden hover:border-orange-600/50 transition-all duration-500 h-full flex flex-col">
                  {product.compare_price && (
                    <div className="absolute top-4 right-4 z-10">
                      <Badge className="bg-orange-600 text-white border-0">
                        Save ${(product.compare_price - product.price).toFixed(0)}
                      </Badge>
                    </div>
                  )}

                  <Link href={`/products/${product.slug}`} aria-label={`View ${product.name}`} className="relative block h-64 overflow-hidden bg-neutral-950">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                      style={{
                        backgroundImage: `url(${product.image_url})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-transparent" />
                  </Link>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-2">
                      <Badge variant="outline" className="text-neutral-400 border-neutral-700">
                        {product.brand}
                      </Badge>
                    </div>

                    <Link href={`/products/${product.slug}`}>
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-500 transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-neutral-400 text-sm mb-4 line-clamp-2 flex-1">
                      {product.description}
                    </p>

                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                        <span className="text-white font-semibold">{product.rating}</span>
                      </div>
                      <span className="text-neutral-500 text-sm">
                        ({product.reviews_count} reviews)
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
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

                      <Button
                        type="button"
                        disabled={product.stock_quantity <= 0}
                        onClick={() => {
                          const result = addToCart(product, 1);
                          setCartNotice(result.ok ? `Added ${product.name} to your cart.` : result.reason);
                        }}
                        className="bg-orange-600 hover:bg-orange-700 text-white disabled:cursor-not-allowed disabled:opacity-40"
                        size="sm"
                      >
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>

                    {product.stock_quantity < 20 && product.stock_quantity > 0 && (
                      <div className="mt-3 text-xs text-yellow-500">
                        Only {product.stock_quantity} left in stock
                      </div>
                    )}
                  </div>
                </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/products">
            <Button size="lg" className="bg-white text-black hover:bg-neutral-200 font-semibold px-8">
              View All Products
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
