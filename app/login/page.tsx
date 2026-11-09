'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';


type FormData = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const router = useRouter();

  const [loginError, setLoginError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (credentials: FormData) => {
    setSubmitting(true);
    setLoginError('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword(credentials);
      if (error || !data.session) {
        setLoginError('Invalid credentials or unavailable authentication service.');
        return;
      }
      // The server independently re-verifies the token and checks trusted app_metadata.role.
      const session = await fetch('/api/admin-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        cache: 'no-store',
        body: JSON.stringify({ access_token: data.session.access_token }),
      });
      if (!session.ok) {
        await supabase.auth.signOut();
        setLoginError('This account does not have administrator access.');
        return;
      }
      router.replace('/admin');
      router.refresh();
    } catch {
      setLoginError('Unable to complete sign-in right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAgNHYyaDJ2LTJoLTJ6bS0yIDJ2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0yLTJ2LTJoLTJ2Mmgyem0wLTRoLTJ2Mmgydi0yem0yIDJ2LTJoLTJ2Mmgyem0wIDR2LTJoLTJ2Ymgyem0yLTJ2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0tMi0ydjJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptMiAydi0yaC0ydjJoMnptMCA0di0yaC0ydjJoMnptMiAydi0yaC0ydjJoMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30" />

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.1, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600 rounded-full blur-[120px]"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

      <div className="relative z-10 flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl backdrop-blur-xl p-8 shadow-2xl hover:border-neutral-700 transition-all duration-300">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="flex items-center justify-center mb-8"
            >
              <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center">
                <LogIn className="w-6 h-6 text-white" />
              </div>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white via-neutral-200 to-neutral-400"
            >
              Welcome Back
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center text-neutral-400 mb-8"
            >
              Sign in to access your account
            </motion.p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
              >
                <Label htmlFor="email" className="text-neutral-300 text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  placeholder="you@example.com"
                  className="mt-2 h-11 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-orange-600 focus:ring-orange-600/20"
                />
                {errors.email && <p className="text-orange-500 text-sm mt-1">{errors.email.message}</p>}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                <Label htmlFor="password" className="text-neutral-300 text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register('password', { required: 'Password is required' })}
                  placeholder="••••••••"
                  className="mt-2 h-11 bg-neutral-800/50 border-neutral-700 text-white placeholder:text-neutral-500 focus:border-orange-600 focus:ring-orange-600/20"
                />
                {errors.password && <p className="text-orange-500 text-sm mt-1">{errors.password.message}</p>}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.6 }}
                className="pt-2"
              >
                {loginError && <p role="alert" className="mb-3 text-sm text-orange-400">{loginError}</p>}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-11 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? 'Signing in…' : 'Sign In'}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="mt-6 pt-6 border-t border-neutral-800 text-center text-sm text-neutral-400"
            >
              <p>Administrator access only. Contact the site owner for an account.</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
