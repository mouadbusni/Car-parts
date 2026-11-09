'use client';

import { motion } from 'framer-motion';
import { Search, ListFilter, ClipboardList, Zap } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function HeroSection() {
  const router = useRouter();
  const [partName, setPartName] = useState('');

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const search = partName.trim();
    router.push(search ? `/products?search=${encodeURIComponent(search)}` : '/products');
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-black via-neutral-900 to-black">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bS0yIDJ2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0yLTJ2LTJoLTJ2Mmgyem0wLTRoLTJ2Mmgydi0yem0yIDJ2LTJoLTJ2Mmgyem0wIDR2LTJoLTJ2Mmgyem0yLTJ2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0tMi0ydjJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMiAydi0yaC0ydjJoMnptMCA0di0yaC0ydjJoMnptMiAydi0yaC0ydjJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.15, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600 rounded-full blur-[120px]"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neutral-600 rounded-full blur-[120px]"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-block mb-6"
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-600/10 border border-orange-600/20 rounded-full backdrop-blur-sm">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-orange-500 font-medium">Performance Redefined</span>
            </div>
          </motion.div>

          <h1 className="text-6xl md:text-8xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-400">
            Premium Auto Parts
          </h1>

          <p className="text-xl md:text-2xl text-neutral-400 mb-12 max-w-3xl mx-auto leading-relaxed">
            Engineer your ride with precision-crafted components.
            <span className="text-white font-semibold"> Performance meets perfection.</span>
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="max-w-2xl mx-auto mb-16"
          >
            <form role="search" onSubmit={submitSearch} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <label htmlFor="autopro-hero-part-search" className="sr-only">Search parts by product name</label>
                <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                <Input
                  id="autopro-hero-part-search"
                  name="search"
                  type="search"
                  value={partName}
                  onChange={(event) => setPartName(event.target.value)}
                  maxLength={120}
                  placeholder="Search auto parts by product name..."
                  className="pl-12 h-14 bg-neutral-900/50 border-neutral-800 text-white placeholder:text-neutral-500 focus:border-orange-600 focus:ring-orange-600/20"
                />
              </div>
              <Button type="submit" className="h-14 px-8 bg-orange-600 hover:bg-orange-700 text-white font-semibold">
                Search
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto"
          >
            {[
              { icon: Search, title: 'PART SEARCH', desc: 'Find products by name' },
              { icon: ListFilter, title: 'SMART FILTERS', desc: 'Browse categories and sort' },
              { icon: ClipboardList, title: 'PART DETAILS', desc: 'Review product information' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                className="group p-6 bg-neutral-900/30 border border-neutral-800 rounded-xl backdrop-blur-sm hover:border-orange-600/50 transition-all duration-300"
              >
                <stat.icon className="w-8 h-8 text-orange-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                <div className="text-3xl font-bold text-white mb-1">{stat.title}</div>
                <div className="text-sm text-neutral-400">{stat.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-neutral-600 rounded-full flex justify-center p-2"
        >
          <motion.div className="w-1 h-2 bg-orange-500 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
