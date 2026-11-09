'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

export const dynamicParams = true;
import {
  ShoppingCart,
  Star,
  Check,
  Shield,
  Truck,
  RotateCcw,
  ChevronLeft,
} from 'lucide-react';
import { supabase, Product } from '@/lib/supabase';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { addToCart } from '@/lib/cart-store';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [cartFeedback, setCartFeedback] = useState('');

  const loadProduct = useCallback(async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (data) setProduct(data);
    setLoading(false);
  }, [slug]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

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

  if (!product) {
    return (
      <main className="min-h-screen bg-black">
        <Header />
        <div className="pt-32 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Product Not Found</h1>
            <Link href="/products">
              <Button>Browse Products</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const discountPercent = product.compare_price
    ? Math.round(((product.compare_price - product.price) / product.compare_price) * 100)
    : 0;

  return (
    <main className="min-h-screen bg-black">
      <Header />

      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Back to Products
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800">
                <div
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ backgroundImage: `url(${product.image_url})` }}
                />
                {product.compare_price && (
                  <div className="absolute top-6 right-6">
                    <Badge className="bg-red-600 text-white text-lg px-4 py-2">
                      -{discountPercent}%
                    </Badge>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Badge variant="outline" className="text-neutral-400 border-neutral-700 mb-4">
                {product.brand}
              </Badge>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(product.rating)
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'text-neutral-700'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-white font-semibold">{product.rating}</span>
                <span className="text-neutral-500">({product.reviews_count} reviews)</span>
              </div>

              <p className="text-neutral-300 text-lg mb-8 leading-relaxed">
                {product.description}
              </p>

              <div className="flex items-baseline gap-4 mb-8">
                <div className="text-5xl font-bold text-white">${product.price.toFixed(2)}</div>
                {product.compare_price && (
                  <div className="text-2xl text-neutral-500 line-through">
                    ${product.compare_price.toFixed(2)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3 mb-8">
                <div className="flex items-center border border-neutral-800 rounded-lg overflow-hidden">
                  <button
                    type="button"
                    aria-label="Decrease selected quantity"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:opacity-40"
                  >
                    -
                  </button>
                  <div className="px-6 py-3 bg-neutral-900 text-white font-semibold">
                    {quantity}
                  </div>
                  <button
                    type="button"
                    aria-label="Increase selected quantity"
                    disabled={quantity >= Math.min(99, Math.max(0, product.stock_quantity))}
                    onClick={() => setQuantity(Math.min(99, product.stock_quantity, quantity + 1))}
                    className="px-4 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:opacity-40"
                  >
                    +
                  </button>
                </div>

                <Button type="button" disabled={product.stock_quantity <= 0} onClick={() => {
                  const result = addToCart(product, quantity);
                  setCartFeedback(result.ok
                    ? `Added ${quantity} ${quantity === 1 ? 'unit' : 'units'} to your cart.`
                    : result.reason);
                }} className="flex-1 h-12 bg-orange-600 hover:bg-orange-700 text-white text-lg font-semibold disabled:cursor-not-allowed disabled:opacity-40">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  Add to Cart
                </Button>
              </div>

              {cartFeedback && (
                <div role="status" aria-live="polite" className="mb-6 rounded-lg border border-orange-800/50 bg-orange-950/30 px-4 py-3 text-orange-200">
                  {cartFeedback}
                  {cartFeedback.startsWith('Added') && <Link href="/cart" className="ml-3 font-semibold underline underline-offset-4">View cart</Link>}
                </div>
              )}

              {product.stock_quantity > 0 ? (
                <div className="flex items-center gap-2 text-green-500 mb-8">
                  <Check className="w-5 h-5" />
                  <span className="font-semibold">In Stock ({product.stock_quantity} available)</span>
                </div>
              ) : (
                <div className="text-red-500 font-semibold mb-8">Out of Stock</div>
              )}

              <Separator className="mb-8 bg-neutral-800" />

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="flex flex-col items-center p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
                  <Shield className="w-6 h-6 text-red-500 mb-2" />
                  <span className="text-xs text-neutral-400 text-center">Product information</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
                  <Truck className="w-6 h-6 text-red-500 mb-2" />
                  <span className="text-xs text-neutral-400 text-center">Delivery not yet configured</span>
                </div>
                <div className="flex flex-col items-center p-4 bg-neutral-900 border border-neutral-800 rounded-lg">
                  <RotateCcw className="w-6 h-6 text-red-500 mb-2" />
                  <span className="text-xs text-neutral-400 text-center">Orders unavailable</span>
                </div>
              </div>

              <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
                <h3 className="text-white font-bold mb-3">Compatible Vehicles</h3>
                <div className="flex flex-wrap gap-2">
                  {product.compatibility.map((vehicle, index) => (
                    <Badge key={index} variant="secondary" className="bg-neutral-800 text-white">
                      {vehicle}
                    </Badge>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Tabs defaultValue="specs" className="w-full">
              <TabsList className="bg-neutral-900 border border-neutral-800">
                <TabsTrigger value="specs">Specifications</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
                <TabsTrigger value="shipping">Shipping</TabsTrigger>
              </TabsList>

              <TabsContent value="specs" className="mt-8">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-6">
                    Technical Specifications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-3 border-b border-neutral-800">
                        <span className="text-neutral-400 capitalize">
                          {key.replace(/_/g, ' ')}
                        </span>
                        <span className="text-white font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="reviews" className="mt-8">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-6">Customer Reviews</h3>
                  <p className="text-neutral-400">No reviews yet. Be the first to review this product!</p>
                </div>
              </TabsContent>

              <TabsContent value="shipping" className="mt-8">
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-white mb-6">Shipping Information</h3>
                  <div className="space-y-4 text-neutral-300">
                    <p>Shipping and returns are not configured for this concept storefront.</p>
                    <p>Cart selections are stored in this browser only. No orders or payments are accepted yet.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
