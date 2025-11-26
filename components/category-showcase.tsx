'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Category } from '@/lib/supabase';
import Link from 'next/link';

interface CategoryShowcaseProps {
  categories: Category[];
}

export default function CategoryShowcase({ categories }: CategoryShowcaseProps) {
  return (
    <section className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            Browse by Category
          </h2>
          <p className="text-xl text-neutral-400">
            Find the perfect parts for your performance build
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={`/categories/${category.slug}`}>
                <div className="group relative h-80 overflow-hidden rounded-xl bg-neutral-900 border border-neutral-800 hover:border-orange-600/50 transition-all duration-500">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{
                      backgroundImage: `url(${category.image_url})`,
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

                  <div className="absolute inset-0 bg-orange-600/0 group-hover:bg-orange-600/10 transition-colors duration-500" />

                  <div className="relative h-full flex flex-col justify-end p-6">
                    <motion.div
                      initial={{ x: 0 }}
                      whileHover={{ x: 5 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-orange-500 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-neutral-400 mb-4 line-clamp-2">
                        {category.description}
                      </p>
                      <div className="flex items-center gap-2 text-orange-500 font-semibold">
                        <span>Explore Parts</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
