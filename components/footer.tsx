'use client';

import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black border-t border-neutral-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <h3 className="text-white font-bold text-lg mb-4">About AutoPro</h3>
            <p className="text-neutral-400 text-sm mb-6">
              Premium automotive parts for performance enthusiasts. Quality guaranteed, performance proven.
            </p>
            <div className="flex gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, index) => (
                <Link
                  key={index}
                  href="#"
                  className="w-10 h-10 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-orange-500 hover:border-orange-600/50 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-3">
              {['Products', 'Categories', 'Brands', 'About Us', 'Blog', 'Careers'].map((link) => (
                <li key={link}>
                  <Link
                    href="#"
                    className="text-neutral-400 hover:text-white transition-colors text-sm"
                  >
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Support</h3>
            <ul className="space-y-3">
              {['Contact Us', 'FAQs', 'Shipping', 'Returns', 'Warranty', 'Track Order'].map(
                (link) => (
                  <li key={link}>
                    <Link
                      href="#"
                      className="text-neutral-400 hover:text-white transition-colors text-sm"
                    >
                      {link}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold text-lg mb-4">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <div className="text-white text-sm">1-800-AUTO-PRO</div>
                  <div className="text-neutral-500 text-xs">Mon-Fri 8AM-8PM EST</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <div className="text-white text-sm">support@autopro.com</div>
                  <div className="text-neutral-500 text-xs">24/7 Email Support</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                <div className="text-white text-sm">
                  123 Performance Blvd<br />Los Angeles, CA 90001
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-900 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-neutral-500 text-sm">
              © {new Date().getFullYear()} AutoPro. All rights reserved.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="text-neutral-500 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-neutral-500 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-neutral-500 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 p-6 bg-neutral-900 border border-neutral-800 rounded-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-white font-bold mb-2">Stay Updated</h4>
              <p className="text-neutral-400 text-sm">
                Get exclusive deals and performance tips
              </p>
            </div>
            <div className="flex gap-3 w-full md:w-auto">
              <Input
                type="email"
                placeholder="Your email"
                className="bg-black border-neutral-800 text-white w-full md:w-64"
              />
              <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
