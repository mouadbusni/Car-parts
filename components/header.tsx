'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, User, Menu, X, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { cartItemCount, useCart } from '@/lib/cart-store';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = cartItemCount(useCart());
  const navItems = [
    { label: 'Products', href: '/products' },
    { label: 'Categories', href: '/categories' },
  ];

  useEffect(() => {
    const syncScroll = () => setIsScrolled(window.scrollY > 50);
    syncScroll();
    window.addEventListener('scroll', syncScroll, { passive: true });
    return () => window.removeEventListener('scroll', syncScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-neutral-800'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center"
            >
              <Wrench className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <div className="text-xl font-bold text-white">AutoPro</div>
              <div className="text-xs text-neutral-400">Performance Parts</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-neutral-300 hover:text-white transition-colors font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/cart" aria-label="View shopping cart">
              <span className="relative inline-flex h-10 w-10 items-center justify-center rounded-md text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span data-testid="header-cart-count" aria-label={`${cartCount} items in cart`} className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-600 px-1 text-xs text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </span>
            </Link>

            <Link href="/login" aria-label="Sign in">
              <Button
                variant="ghost"
                size="icon"
                className="text-neutral-300 hover:text-white hover:bg-neutral-800"
              >
                <User className="w-5 h-5" />
              </Button>
            </Link>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="autopro-mobile-menu"
              onClick={() => setIsMenuOpen((open) => !open)}
              className="md:hidden text-neutral-300 hover:text-white hover:bg-neutral-800"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <nav id="autopro-mobile-menu" aria-label="Mobile navigation" className="md:hidden border-t border-neutral-800 bg-neutral-950/95 px-6 py-4 backdrop-blur-xl">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="block rounded-md px-3 py-3 text-neutral-200 hover:bg-neutral-800 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </motion.header>
  );
}
