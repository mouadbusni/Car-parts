import { supabase } from '@/lib/supabase';
import HeroSection from '@/components/hero-section';
import CategoryShowcase from '@/components/category-showcase';
import FeaturedProducts from '@/components/featured-products';
import Header from '@/components/header';
import Footer from '@/components/footer';

export const revalidate = 3600;

export default async function Home() {
  const [{ data: categories }, { data: featuredProducts }] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase
      .from('products')
      .select('*')
      .eq('is_featured', true)
      .order('rating', { ascending: false })
      .limit(6),
  ]);

  return (
    <main className="min-h-screen bg-black">
      <Header />
      <HeroSection />
      {categories && <CategoryShowcase categories={categories} />}
      {featuredProducts && <FeaturedProducts products={featuredProducts} />}
      <Footer />
    </main>
  );
}
