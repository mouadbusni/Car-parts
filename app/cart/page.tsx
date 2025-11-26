'use client';

import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';

interface CartItem {
  id: string;
  name: string;
  brand: string;
  image: string;
  price: number;
  quantity: number;
}

export default function CartPage() {
  const cartItems: CartItem[] = [];
  const subtotal = 0;
  const tax = 0;
  const shipping = 0;
  const total = 0;

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
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Shopping Cart</h1>
            <p className="text-xl text-neutral-400 mb-12">
              {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
            </p>

            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                  className="w-24 h-24 bg-neutral-900 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <ShoppingBag className="w-12 h-12 text-neutral-600" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-4">Your cart is empty</h2>
                <p className="text-neutral-400 mb-8">
                  Start adding some premium parts to your collection
                </p>
                <Link href="/products">
                  <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                    Browse Products
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <div className="space-y-4">
                    {cartItems.map((item: any, index: number) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 flex gap-6"
                      >
                        <div className="w-32 h-32 bg-neutral-950 rounded-lg overflow-hidden">
                          <div
                            className="w-full h-full bg-cover bg-center"
                            style={{ backgroundImage: `url(${item.image})` }}
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-white mb-2">{item.name}</h3>
                          <p className="text-neutral-400 text-sm mb-4">{item.brand}</p>

                          <div className="flex items-center gap-4">
                            <div className="flex items-center border border-neutral-800 rounded-lg overflow-hidden">
                              <button className="px-3 py-2 bg-neutral-950 text-white hover:bg-neutral-800 transition-colors">
                                <Minus className="w-4 h-4" />
                              </button>
                              <div className="px-4 py-2 bg-neutral-950 text-white font-semibold">
                                {item.quantity}
                              </div>
                              <button className="px-3 py-2 bg-neutral-950 text-white hover:bg-neutral-800 transition-colors">
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-orange-500 hover:text-orange-400 hover:bg-orange-950"
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            ${(item.price * item.quantity).toFixed(2)}
                          </div>
                          <div className="text-sm text-neutral-500">
                            ${item.price.toFixed(2)} each
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 sticky top-32">
                    <h2 className="text-2xl font-bold text-white mb-6">Order Summary</h2>

                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between text-neutral-300">
                        <span>Subtotal</span>
                        <span className="font-semibold">${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-neutral-300">
                        <span>Shipping</span>
                        <span className="font-semibold">
                          {shipping === 0 ? 'FREE' : `$${(shipping as number).toFixed(2)}`}
                        </span>
                      </div>
                      <div className="flex justify-between text-neutral-300">
                        <span>Tax</span>
                        <span className="font-semibold">${tax.toFixed(2)}</span>
                      </div>

                      <Separator className="bg-neutral-800" />

                      <div className="flex justify-between text-white text-xl font-bold">
                        <span>Total</span>
                        <span>${total.toFixed(2)}</span>
                      </div>
                    </div>

                    <Button className="w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-semibold mb-4">
                      Proceed to Checkout
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>

                    <Link href="/products">
                      <Button variant="outline" className="w-full border-neutral-800">
                        Continue Shopping
                      </Button>
                    </Link>

                    <div className="mt-6 p-4 bg-orange-950/20 border border-orange-900/30 rounded-lg">
                      <p className="text-sm text-orange-400 text-center">
                        Free shipping on orders over $50!
                      </p>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
