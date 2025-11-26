'use client';

import { motion } from 'framer-motion';
import { ShoppingCart, User, Menu, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setIsScrolled(window.scrollY > 50);
    });
  }

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
            {['Products', 'Categories', 'Brands', 'Support'].map((item) => (
              <Link
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-neutral-300 hover:text-white transition-colors font-medium"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-neutral-300 hover:text-white hover:bg-neutral-800"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-600 rounded-full text-xs text-white flex items-center justify-center">
                  0
                </span>
              </Button>
            </Link>

            <Link href="/login">
              <Button
                variant="ghost"
                size="icon"
                className="text-neutral-300 hover:text-white hover:bg-neutral-800"
              >
                <User className="w-5 h-5" />
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-neutral-300 hover:text-white hover:bg-neutral-800"
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
