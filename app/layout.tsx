import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'AutoPro - Premium Auto Parts for Performance Enthusiasts',
  description: 'Shop premium automotive parts and performance components. Quality guaranteed, performance proven. Free shipping on orders over $50.',
  keywords: ['auto parts', 'car parts', 'performance parts', 'automotive', 'turbo', 'suspension', 'brakes'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
