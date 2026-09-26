'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, Play, Shield, Zap, Globe, MessageSquare, Star,
  ChevronDown, Check, X, Menu, XIcon, Mail, Smartphone, CreditCard,
  Clock, Users, Hash, Wifi,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ─── Animated Counter ──────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = '', duration = 2000 }: { target: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span>{count.toLocaleString()}{suffix}</span>;
}

// ─── Fade In Component ─────────────────────────────────────────────────────
function FadeIn({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Services Data ─────────────────────────────────────────────────────────
const services = [
  { name: 'Gmail', icon: Mail, category: 'Email' },
  { name: 'OpenAI', icon: Zap, category: 'AI' },
  { name: 'WhatsApp', icon: MessageSquare, category: 'Messaging' },
  { name: 'Telegram', icon: MessageSquare, category: 'Messaging' },
  { name: 'Tinder', icon: Users, category: 'Dating' },
  { name: 'Instagram', icon: Globe, category: 'Social' },
  { name: 'TikTok', icon: Globe, category: 'Social' },
  { name: 'Twitter/X', icon: Globe, category: 'Social' },
  { name: 'Facebook', icon: Globe, category: 'Social' },
  { name: 'Discord', icon: MessageSquare, category: 'Gaming' },
  { name: 'Snapchat', icon: MessageSquare, category: 'Messaging' },
  { name: 'Signal', icon: Shield, category: 'Messaging' },
];

const faqs = [
  { q: 'Is this legal?', a: 'Yes. We provide real SIM numbers from licensed providers. Using virtual numbers for verification is legal in most jurisdictions.' },
  { q: 'How fast do codes arrive?', a: 'Most codes arrive within 30 seconds. Our average delivery time is under 30s across all services and countries.' },
  { q: 'What if I don\'t receive a code?', a: 'If no SMS arrives within 20 minutes, the order expires and you get an automatic full refund to your wallet.' },
  { q: 'Which payment methods do you accept?', a: 'We accept Nigerian Naira (Momo, card, bank transfer), Ghanaian Cedi, and cryptocurrency (BTC, USDT). All amounts are converted to USD.' },
  { q: 'Do you store my verification codes?', a: 'No. We never log or store the content of SMS messages. Once you view your code, it\'s only visible in your session.' },
  { q: 'Can I use these numbers for WhatsApp?', a: 'Yes! WhatsApp is one of our most popular services. Numbers work for WhatsApp verification in most countries.' },
  { q: 'What happens if a number doesn\'t work?', a: 'If a number is already used or doesn\'t work for the selected service, you can cancel and get an instant refund.' },
  { q: 'How do I get a refund?', a: 'Refunds are automatic. If an order expires or the provider confirms the number didn\'t work, funds return to your wallet instantly.' },
];

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Navbar ──────────────────────────────────────────────────────── */}
      <nav className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled ? 'glass border-b shadow-sm' : 'bg-transparent'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-display font-bold text-xl text-text-primary">SimbaSMS</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              <a href="#how-it-works" className="text-body-sm text-text-secondary hover:text-text-primary transition-colors">How it Works</a>
              <a href="#services" className="text-body-sm text-text-secondary hover:text-text-primary transition-colors">Services</a>
              <a href="#pricing" className="text-body-sm text-text-secondary hover:text-text-primary transition-colors">Pricing</a>
              <a href="#faq" className="text-body-sm text-text-secondary hover:text-text-primary transition-colors">FAQ</a>
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>

            <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <XIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass border-b"
          >
            <div className="px-4 py-4 space-y-3">
              <a href="#how-it-works" className="block text-body-sm text-text-secondary py-2">How it Works</a>
              <a href="#services" className="block text-body-sm text-text-secondary py-2">Services</a>
              <a href="#pricing" className="block text-body-sm text-text-secondary py-2">Pricing</a>
              <a href="#faq" className="block text-body-sm text-text-secondary py-2">FAQ</a>
              <div className="flex gap-2 pt-2">
                <Link href="/login" className="flex-1"><Button variant="secondary" className="w-full">Log in</Button></Link>
                <Link href="/register" className="flex-1"><Button className="w-full">Get Started</Button></Link>
              </div>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ─── Hero ────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background mesh */}
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,166,35,0.08)_0%,transparent_70%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-20">
          <FadeIn>
            <Badge variant="primary" size="lg" className="mb-6">
              <Zap className="h-3 w-3" /> Trusted by 10,000+ users worldwide
            </Badge>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="font-display text-display-lg sm:text-display-xl font-bold text-text-primary mb-6 max-w-4xl mx-auto">
              Verify Anything.{' '}
              <span className="text-gradient-primary">Anywhere.</span>{' '}
              Instantly.
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-body-lg sm:text-heading-sm text-text-secondary max-w-2xl mx-auto mb-8">
              Buy real mobile numbers from 145+ countries to receive SMS verification codes for Gmail, OpenAI, WhatsApp, Tinder, and 2,500+ services.
            </p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button size="xl" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
                  Buy a Number
                </Button>
              </Link>
              <Button variant="ghost" size="xl" icon={<Play className="h-5 w-5" />}>
                See How It Works
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="mt-12 flex items-center justify-center gap-6 text-text-tertiary">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 border-2 border-surface" />
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <span className="text-body-sm">4.9/5 from 2,000+ reviews</span>
            </div>
          </FadeIn>

          {/* Hero visual - floating dashboard mockup */}
          <FadeIn delay={0.5}>
            <div className="mt-16 relative max-w-3xl mx-auto">
              <div className="relative rounded-2xl border border-border bg-surface shadow-xl overflow-hidden">
                <div className="p-4 border-b border-border flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-error/50" />
                  <div className="w-3 h-3 rounded-full bg-warning/50" />
                  <div className="w-3 h-3 rounded-full bg-accent/50" />
                  <div className="flex-1 text-center text-body-xs text-text-tertiary">dashboard.simbasms.com</div>
                </div>
                <div className="p-6 grid grid-cols-3 gap-4">
                  <div className="col-span-2 space-y-3">
                    <div className="h-4 w-1/3 bg-border rounded animate-pulse" />
                    <div className="h-8 w-2/3 bg-border/50 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-border/30 rounded animate-pulse" />
                  </div>
                  <div className="space-y-2">
                    <div className="h-20 bg-primary/10 rounded-lg animate-pulse" />
                    <div className="h-12 bg-accent/10 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
              {/* Floating notification */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 0.5 }}
                className="absolute -bottom-4 -right-4 sm:right-8 bg-surface border border-accent/30 rounded-xl p-3 shadow-lg"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="text-body-xs font-medium text-text-primary">SMS Received!</p>
                    <p className="text-body-xs text-text-tertiary mono">Code: 847291</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Stats Strip ─────────────────────────────────────────────────── */}
      <section className="border-y border-border bg-surface/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 145, suffix: '+', label: 'Countries', icon: Globe },
              { value: 2500, suffix: '+', label: 'Services', icon: Hash },
              { value: 99.2, suffix: '%', label: 'Success Rate', icon: Wifi },
              { value: 30, suffix: 's', label: 'Avg. Delivery', icon: Clock },
            ].map((stat, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="text-center">
                  <stat.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                  <div className="stat-number text-text-primary">
                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                  </div>
                  <p className="text-body-sm text-text-secondary mt-1">{stat.label}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ────────────────────────────────────────────────── */}
      <section id="how-it-works" className="section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-16">
              <Badge variant="outline" size="lg" className="mb-4">Simple Process</Badge>
              <h2 className="font-display text-display-sm sm:text-display-md font-bold text-text-primary mb-4">
                How It Works
              </h2>
              <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
                Three simple steps to receive your verification code
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-1/6 right-1/6 h-px border-t-2 border-dashed border-border" />

            {[
              { step: 1, title: 'Fund Your Wallet', desc: 'Top up with Momo, card, or bank transfer via Paystack. Pay in NGN, GHS, or crypto — balance is in USD.', icon: CreditCard },
              { step: 2, title: 'Pick Service & Country', desc: 'Choose from 2,500+ services like Gmail, OpenAI, WhatsApp. Select your preferred country.', icon: Globe },
              { step: 3, title: 'Receive Your Code', desc: 'Get a real phone number and receive the SMS verification code in real-time. Average delivery: 30 seconds.', icon: MessageSquare },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="relative text-center card-hover rounded-xl border border-border bg-surface p-6">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center mx-auto mb-4 shadow-glow">
                    <item.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-body-xs font-bold px-3 py-1 rounded-full">
                    Step {item.step}
                  </div>
                  <h3 className="font-display text-heading-sm font-semibold text-text-primary mb-2">{item.title}</h3>
                  <p className="text-body-sm text-text-secondary">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Supported Services ──────────────────────────────────────────── */}
      <section id="services" className="section bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <Badge variant="outline" size="lg" className="mb-4">2,500+ Services</Badge>
              <h2 className="font-display text-display-sm sm:text-display-md font-bold text-text-primary mb-4">
                Works With Everything
              </h2>
              <p className="text-body-lg text-text-secondary max-w-2xl mx-auto">
                From social media to AI platforms, we support verification for thousands of services
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
            {services.map((service, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="card-hover rounded-xl border border-border bg-surface p-4 text-center cursor-pointer group">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                    <service.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-body-xs font-medium text-text-primary">{service.name}</p>
                  <p className="text-body-xs text-text-tertiary mt-0.5">From $0.50</p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.5}>
            <div className="text-center mt-8">
              <Link href="/register">
                <Button variant="outline">
                  View All 2,500+ Services <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Why SimbaSMS ────────────────────────────────────────────────── */}
      <section id="pricing" className="section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <Badge variant="outline" size="lg" className="mb-4">Why Choose Us</Badge>
              <h2 className="font-display text-display-sm sm:text-display-md font-bold text-text-primary mb-4">
                The SimbaSMS Advantage
              </h2>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <FadeIn>
              <div className="rounded-xl border-2 border-primary/30 bg-surface p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-primary-dark" />
                <h3 className="font-display text-heading-md font-bold text-text-primary mb-4 flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <span className="text-primary font-bold text-sm">S</span>
                  </div>
                  SimbaSMS
                </h3>
                <div className="space-y-3">
                  {[
                    ['Lowest prices', true],
                    ['<30s delivery', true],
                    ['145+ countries', true],
                    ['Momo + Card + Crypto', true],
                    ['Instant refunds', true],
                    ['24/7 support', true],
                  ].map(([text, check], i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Check className="h-4 w-4 text-accent shrink-0" />
                      <span className="text-body-sm text-text-primary">{text as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.15}>
              <div className="rounded-xl border border-border bg-surface/50 p-6 opacity-70">
                <h3 className="font-display text-heading-md font-semibold text-text-secondary mb-4">Other Platforms</h3>
                <div className="space-y-3">
                  {[
                    ['Higher markups', false],
                    ['5-10 min delivery', false],
                    ['Limited countries', false],
                    ['Card only', false],
                    ['Slow refund process', false],
                    ['Email support only', false],
                  ].map(([text, check], i) => (
                    <div key={i} className="flex items-center gap-3">
                      <X className="h-4 w-4 text-error shrink-0" />
                      <span className="text-body-sm text-text-secondary">{text as string}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── Trust & Security ────────────────────────────────────────────── */}
      <section className="section bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <h2 className="font-display text-display-sm font-bold text-text-primary mb-4">
                Trust & Security
              </h2>
              <p className="text-body-lg text-text-secondary">Your money and data are safe with us</p>
            </div>
          </FadeIn>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: 'Bank-grade Encryption', desc: 'All data encrypted in transit and at rest with AES-256.' },
              { icon: Zap, title: 'No Code Logging', desc: 'We never store your SMS content. Privacy by design.' },
              { icon: Smartphone, title: 'Real Carrier SIMs', desc: 'Numbers from real mobile operators, not VoIP.' },
              { icon: CreditCard, title: 'Instant Refunds', desc: 'Automatic refunds when orders expire or fail.' },
            ].map((item, i) => (
              <FadeIn key={i} delay={i * 0.1}>
                <div className="card-hover rounded-xl border border-border bg-surface p-5">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold text-text-primary mb-1">{item.title}</h3>
                  <p className="text-body-sm text-text-secondary">{item.desc}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" className="section">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <Badge variant="outline" size="lg" className="mb-4">FAQ</Badge>
              <h2 className="font-display text-display-sm font-bold text-text-primary mb-4">
                Frequently Asked Questions
              </h2>
            </div>
          </FadeIn>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <FadeIn key={i} delay={i * 0.05}>
                <div className="rounded-xl border border-border bg-surface overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left hover:bg-surface-secondary transition-colors"
                  >
                    <span className="font-medium text-text-primary pr-4">{faq.q}</span>
                    <ChevronDown className={cn(
                      'h-5 w-5 text-text-tertiary shrink-0 transition-transform duration-250',
                      openFaq === i && 'rotate-180'
                    )} />
                  </button>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      className="px-5 pb-5"
                    >
                      <p className="text-body-sm text-text-secondary">{faq.a}</p>
                    </motion.div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Final CTA ───────────────────────────────────────────────────── */}
      <section className="section relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,166,35,0.1)_0%,transparent_60%)]" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeIn>
            <h2 className="font-display text-display-sm sm:text-display-md font-bold text-text-primary mb-4">
              Ready to verify without limits?
            </h2>
            <p className="text-body-lg text-text-secondary mb-8">
              Create your account in 30 seconds. Fund with Momo. Start verifying.
            </p>
            <Link href="/register">
              <Button size="xl" icon={<ArrowRight className="h-5 w-5" />} iconPosition="right">
                Create Free Account
              </Button>
            </Link>
            <p className="text-body-sm text-text-tertiary mt-4">
              No subscription. Pay only for what you use.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-surface/50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-text-primary mb-3">Product</h4>
              <div className="space-y-2">
                <a href="#services" className="block text-body-sm text-text-secondary hover:text-text-primary transition-colors">Services</a>
                <a href="#pricing" className="block text-body-sm text-text-secondary hover:text-text-primary transition-colors">Pricing</a>
                <a href="#" className="block text-body-sm text-text-secondary hover:text-text-primary transition-colors">API</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-3">Company</h4>
              <div className="space-y-2">
                <a href="#" className="block text-body-sm text-text-secondary hover:text-text-primary transition-colors">About</a>
                <a href="#" className="block text-body-sm text-text-secondary hover:text-text-primary transition-colors">Blog</a>
                <a href="#" className="block text-body-sm text-text-secondary hover:text-text-primary transition-colors">Contact</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-3">Legal</h4>
              <div className="space-y-2">
                <a href="#" className="block text-body-sm text-text-secondary hover:text-text-primary transition-colors">Terms</a>
                <a href="#" className="block text-body-sm text-text-secondary hover:text-text-primary transition-colors">Privacy</a>
                <a href="#" className="block text-body-sm text-text-secondary hover:text-text-primary transition-colors">Refund Policy</a>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-text-primary mb-3">Support</h4>
              <div className="space-y-2">
                <a href="#" className="block text-body-sm text-text-secondary hover:text-text-primary transition-colors">Help Center</a>
                <a href="#" className="block text-body-sm text-text-secondary hover:text-text-primary transition-colors">Telegram</a>
                <a href="mailto:support@simbasms.com" className="block text-body-sm text-text-secondary hover:text-text-primary transition-colors">Email</a>
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <span className="text-white font-bold text-xs">S</span>
              </div>
              <span className="text-body-sm text-text-secondary">© 2026 SimbaSMS. Made in Nigeria 🇳🇬</span>
            </div>
            <div className="flex items-center gap-4">
              <a href="#" className="text-text-tertiary hover:text-text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="text-text-tertiary hover:text-text-primary transition-colors">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
