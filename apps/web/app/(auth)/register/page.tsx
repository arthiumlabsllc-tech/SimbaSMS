'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, User, Check, Shield } from 'lucide-react';
import { apiFetch, setToken } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-error' };
  if (score <= 2) return { score: 2, label: 'Fair', color: 'bg-warning' };
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-primary' };
  return { score: 4, label: 'Strong', color: 'bg-accent' };
}

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const passwordStrength = useMemo(() => getPasswordStrength(password), [password]);
  const passwordsMatch = confirmPassword.length > 0 && password === confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreedToTerms) {
      setError('Please accept the Terms of Service and Privacy Policy');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(data.access_token);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-base">
      {/* Form side */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-8 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[400px] py-8"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-display font-bold text-xl text-content">SimbaSMS</span>
          </Link>

          <h1 className="font-display text-display-sm font-bold text-content mb-2">
            Create your account
          </h1>
          <p className="text-body-md text-content-secondary mb-8">
            Start receiving SMS verification codes in seconds
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

          <form onSubmit={handleSubmit} className="space-y-4">
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
                placeholder="Create a strong password"
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
                minLength={8}
                autoComplete="new-password"
              />
              {/* Password strength meter */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors duration-300',
                          i <= passwordStrength.score ? passwordStrength.color : 'bg-border'
                        )}
                      />
                    ))}
                  </div>
                  <p className={cn(
                    'text-body-xs font-medium transition-colors',
                    passwordStrength.score <= 1 ? 'text-error' :
                    passwordStrength.score <= 2 ? 'text-warning' :
                    passwordStrength.score <= 3 ? 'text-primary' : 'text-accent'
                  )}>
                    {passwordStrength.label} password
                  </p>
                </div>
              )}
            </div>

            <Input
              label="Confirm password"
              type="password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              startContent={<Lock className="h-4 w-4" />}
              success={passwordsMatch}
              error={confirmPassword.length > 0 && !passwordsMatch ? 'Passwords do not match' : undefined}
              required
              autoComplete="new-password"
            />

            {/* Terms checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="relative mt-0.5">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="sr-only peer"
                />
                <div className={cn(
                  'w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center',
                  agreedToTerms
                    ? 'bg-primary border-primary'
                    : 'border-line group-hover:border-content-tertiary'
                )}>
                  {agreedToTerms && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </div>
              </div>
              <span className="text-body-xs text-content-secondary leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-primary hover:underline font-medium">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-primary hover:underline font-medium">Privacy Policy</a>.
                I understand my data is handled per the NDPA.
              </span>
            </label>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              icon={<ArrowRight className="h-4 w-4" />}
              iconPosition="right"
            >
              Create account
            </Button>
          </form>

          {/* Trust signals */}
          <div className="flex items-center justify-center gap-4 mt-6 text-content-tertiary">
            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              <span className="text-body-xs">Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" />
              <span className="text-body-xs">No logs</span>
            </div>
          </div>

          <p className="text-body-sm text-content-secondary text-center mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-primary hover:text-primary-dark font-medium transition-colors">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Visual side */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden bg-base">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(0,201,167,0.12)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_70%,rgba(245,166,35,0.08)_0%,transparent_50%)]" />

        <div className="relative z-10 flex flex-col justify-center items-center p-12 w-full">
          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-6 w-full max-w-sm"
          >
            <h2 className="font-display text-heading-lg font-bold text-content text-center mb-8">
              Everything you need for SMS verification
            </h2>

            {[
              { title: '145+ Countries', desc: 'Numbers from every corner of the globe', delay: 0.2 },
              { title: '2,500+ Services', desc: 'Gmail, OpenAI, WhatsApp, Tinder, and more', delay: 0.35 },
              { title: 'Instant Refunds', desc: 'Automatic refund if no code arrives', delay: 0.5 },
              { title: 'Pay Your Way', desc: 'Momo, card, bank transfer, or crypto', delay: 0.65 },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: feature.delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-4 p-4 rounded-xl bg-elevated/50 border border-line"
              >
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Check className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-body-sm font-semibold text-content">{feature.title}</p>
                  <p className="text-body-xs text-content-secondary mt-0.5">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
