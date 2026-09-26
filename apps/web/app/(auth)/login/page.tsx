'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, MessageSquare, Star } from 'lucide-react';
import { apiFetch, setToken } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(data.access_token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-base">
      {/* Form side */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px]"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-display font-bold text-xl text-content">SimbaSMS</span>
          </Link>

          <h1 className="font-display text-display-sm font-bold text-content mb-2">
            Welcome back
          </h1>
          <p className="text-body-md text-content-secondary mb-8">
            Log in to your account to continue verifying
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-error/10 border border-error/20 text-error text-body-sm mb-6"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-error shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              startContent={<Mail className="h-4 w-4" />}
              required
              autoComplete="email"
            />

            <div>
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                startContent={<Lock className="h-4 w-4" />}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-content-tertiary hover:text-content transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
                required
                autoComplete="current-password"
              />
              <div className="flex justify-end mt-2">
                <button type="button" className="text-body-xs text-primary hover:text-primary-dark transition-colors font-medium">
                  Forgot password?
                </button>
              </div>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
            >
              Log in
            </Button>
          </form>

          <p className="text-body-sm text-content-secondary text-center mt-8">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-primary hover:text-primary-dark font-medium transition-colors">
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Visual side */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden bg-base">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(245,166,35,0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(0,201,167,0.08)_0%,transparent_50%)]" />

        <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
          {/* Floating phone mockup */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="w-64 h-[420px] rounded-3xl border-2 border-line bg-elevated shadow-xl overflow-hidden">
              {/* Phone status bar */}
              <div className="h-8 bg-elevated-secondary flex items-center justify-center">
                <div className="w-20 h-4 rounded-full bg-line" />
              </div>
              {/* Phone content */}
              <div className="p-5 space-y-4">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                    <span className="text-white font-bold text-xs">S</span>
                  </div>
                  <div>
                    <p className="text-body-xs font-medium text-content">SimbaSMS</p>
                    <p className="text-body-xs text-content-tertiary">Verification code</p>
                  </div>
                </div>

                <div className="bg-elevated-secondary rounded-xl p-4">
                  <p className="text-body-xs text-content-tertiary mb-1">Your code from Gmail:</p>
                  <motion.p
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 1.5, duration: 0.4 }}
                    className="mono text-heading-lg font-bold text-accent"
                  >
                    G-847291
                  </motion.p>
                </div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.8 }}
                  className="flex items-center gap-2 text-accent"
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="text-body-xs font-medium">Code received in 12s</span>
                </motion.div>
              </div>
            </div>

            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 rounded-4xl blur-xl" />
          </motion.div>

          {/* Testimonial */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-10 max-w-sm text-center"
          >
            <div className="flex items-center justify-center gap-0.5 mb-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-3.5 w-3.5 fill-primary text-primary" />
              ))}
            </div>
            <p className="text-body-sm text-content-secondary italic">
              &ldquo;I verified 30+ Gmail accounts in one session. The codes arrive before I even finish typing the email.&rdquo;
            </p>
            <p className="text-body-xs text-content-tertiary mt-3">
              — Adebayo O., Lagos 🇳🇬
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
