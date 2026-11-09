'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { cartItemCount, cartSubtotal, removeFromCart, setCartQuantity, useCart, type CartLine } from '@/lib/cart-store';

function CartProduct({ line }: { line: CartLine }) {
  const [error, setError] = useState('');
  const updateQuantity = (quantity: number) => {
    const result = setCartQuantity(line.productId, quantity);
    setError(result.ok ? '' : result.reason);
  };
  return (
    <article data-testid="cart-product" className="rounded-xl border border-neutral-800 bg-neutral-900 p-4 sm:p-6">
      <div className="flex gap-4 sm:gap-6">
        <Link href={`/products/${line.slug}`} aria-label={`View ${line.name}`} className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-neutral-950 sm:h-32 sm:w-32">
          {line.imageUrl && <img src={line.imageUrl} alt={line.name} loading="lazy" className="h-full w-full object-cover" />}
        </Link>
        <div className="min-w-0 flex-1">
          <Link href={`/products/${line.slug}`} className="text-lg font-bold text-white hover:text-orange-400">{line.name}</Link>
          <p className="mb-3 text-sm text-neutral-400">{line.brand}</p>
          <p className="mb-4 text-sm font-medium text-neutral-300">${line.unitPrice.toFixed(2)} each</p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center overflow-hidden rounded-lg border border-neutral-700">
              <button type="button" aria-label={`Decrease quantity of ${line.name}`} onClick={() => updateQuantity(line.quantity - 1)} className="bg-neutral-950 px-3 py-2 text-white hover:bg-neutral-800">
                <Minus className="h-4 w-4" />
              </button>
              <span aria-label="Quantity" className="min-w-[44px] bg-neutral-950 px-3 py-2 text-center text-white" data-testid="cart-quantity">{line.quantity}</span>
              <button type="button" aria-label={`Increase quantity of ${line.name}`} disabled={line.quantity >= line.stockAtAdd} onClick={() => updateQuantity(line.quantity + 1)} className="bg-neutral-950 px-3 py-2 text-white hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-40">
                <Plus className="h-4 w-4" />
              </button>
            </div>
            <button type="button" aria-label={`Remove ${line.name} from cart`} onClick={() => removeFromCart(line.productId)} className="rounded-lg p-2 text-orange-500 hover:bg-orange-950 hover:text-orange-300">
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
        <strong className="hidden text-xl text-white sm:block">${(line.unitPrice * line.quantity).toFixed(2)}</strong>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-orange-400">{error}</p>}
    </article>
  );
}

export default function CartPage() {
  const lines = useCart();
  const count = cartItemCount(lines);
  const subtotal = cartSubtotal(lines);

  return (
    <main className="min-h-screen bg-black">
      <Header />
      <div className="mx-auto max-w-7xl px-4 pb-20 pt-32 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .4 }}>
          <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-orange-500">AutoPro / Your selection</p>
          <h1 className="mb-3 text-4xl font-bold text-white sm:text-6xl">Shopping Cart</h1>
          <p className="mb-10 text-neutral-400" data-testid="cart-item-count">
            {count} {count === 1 ? 'item' : 'items'} selected
          </p>
        </motion.div>

        {lines.length === 0 ? (
          <section className="rounded-2xl border border-neutral-800 bg-neutral-900 px-6 py-16 text-center" data-testid="empty-cart">
            <ShoppingBag className="mx-auto mb-5 h-14 w-14 text-orange-500" />
            <h2 className="mb-3 text-2xl font-bold text-white">Your cart is empty</h2>
            <p className="mb-8 text-neutral-400">Find parts in the catalog and add them to your selection.</p>
            <Link href="/products" className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-6 py-3 font-semibold text-white hover:bg-orange-700">
              Browse Products <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <section aria-label="Selected products" className="space-y-4">
              {lines.map(line => <CartProduct key={line.productId} line={line} />)}
              <Link href="/products" className="inline-flex items-center gap-2 py-3 text-sm font-semibold text-orange-400 hover:text-orange-300">
                Continue Shopping <ArrowRight className="h-4 w-4" />
              </Link>
            </section>
            <aside aria-label="Cart summary" className="h-fit rounded-xl border border-neutral-800 bg-neutral-900 p-6 lg:sticky lg:top-28">
              <h2 className="mb-5 text-xl font-bold text-white">Cart Summary</h2>
              <div className="mb-5 flex items-center justify-between border-b border-neutral-800 pb-5 text-neutral-300">
                <span>Estimated subtotal</span>
                <strong className="text-xl text-white" data-testid="cart-subtotal">${subtotal.toFixed(2)}</strong>
              </div>
              <p className="mb-5 text-sm leading-6 text-neutral-400">
                Prices are a browser-local preview. Shipping, tax, stock and current pricing must be verified before orders can be accepted.
              </p>
              <button type="button" disabled aria-describedby="autopro-checkout-note" className="w-full cursor-not-allowed rounded-lg bg-neutral-700 px-5 py-3 font-semibold text-neutral-300">
                Checkout unavailable
              </button>
              <p id="autopro-checkout-note" className="mt-3 text-xs leading-5 text-neutral-500">
                Orders and payments are not enabled in this concept storefront.
              </p>
            </aside>
          </div>
        )}
      </div>
      <Footer />
    </main>
  );
}
