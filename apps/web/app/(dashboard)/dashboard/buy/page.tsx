'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Check, ArrowRight, ArrowLeft, Globe, Mail, Zap,
  MessageSquare, Users, Shield, CreditCard, Wifi, WifiOff,
  Smartphone, Hash,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { SUPPORTED_SERVICES, SUPPORTED_COUNTRIES, SERVICE_LABELS, COUNTRY_LABELS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const serviceIcons: Record<string, any> = {
  gmail: Mail, openai: Zap, whatsapp: MessageSquare, telegram: MessageSquare,
  tinder: Users, twitter: Globe, facebook: Globe, instagram: Globe,
  tiktok: Globe, snapchat: MessageSquare, discord: MessageSquare,
  signal: Shield, wechat: MessageSquare, line: MessageSquare,
  viber: MessageSquare, kakao: MessageSquare, grab: Globe, uber: Globe,
};

const categories = ['All', 'Messaging', 'Social', 'AI', 'Dating', 'Gaming', 'Email'];

const serviceCategory: Record<string, string> = {
  gmail: 'Email', openai: 'AI', whatsapp: 'Messaging', telegram: 'Messaging',
  tinder: 'Dating', twitter: 'Social', facebook: 'Social', instagram: 'Social',
  tiktok: 'Social', snapchat: 'Messaging', discord: 'Gaming', signal: 'Messaging',
  wechat: 'Messaging', line: 'Messaging', viber: 'Messaging', kakao: 'Messaging',
  grab: 'Social', uber: 'Social',
};

const popularCountries = ['US', 'GB', 'NG', 'GH', 'KE', 'IN'];

const countryFlags: Record<string, string> = {
  US: '🇺🇸', GB: '🇬🇧', NG: '🇳🇬', GH: '🇬🇭', ZA: '🇿🇦', KE: '🇰🇪',
  IN: '🇮🇳', PH: '🇵🇭', ID: '🇮🇩', BR: '🇧🇷', MX: '🇲🇽', DE: '🇩🇪',
  FR: '🇫🇷', ES: '🇪🇸', IT: '🇮🇹', CA: '🇨🇦', AU: '🇦🇺', JP: '🇯🇵',
  KR: '🇰🇷', CN: '🇨🇳', RU: '🇷🇺', TR: '🇹🇷', TH: '🇹🇭', VN: '🇻🇳',
  MY: '🇲🇾', SG: '🇸🇬', AR: '🇦🇷', CO: '🇨🇴', PE: '🇵🇪', CL: '🇨🇱',
  NL: '🇳🇱', BE: '🇧🇪', SE: '🇸🇪', NO: '🇳🇴', DK: '🇩🇰', FI: '🇫🇮',
  PL: '🇵🇱', CZ: '🇨🇿', SK: '🇸🇰', HU: '🇭🇺', RO: '🇷🇴', BG: '🇧🇬',
  HR: '🇭🇷', RS: '🇷🇸', UA: '🇺🇦', NZ: '🇳🇿',
};

export default function BuyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(1);
  const [service, setService] = useState(searchParams?.get('service') || 'gmail');
  const [country, setCountry] = useState('');
  const [serviceSearch, setServiceSearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [price, setPrice] = useState<any>(null);
  const [checkingPrice, setCheckingPrice] = useState(false);
  const [buying, setBuying] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    apiFetch('/auth/me').then(setUser);
  }, []);

  // When service changes, preselect if from URL
  useEffect(() => {
    const s = searchParams?.get('service');
    if (s) setService(s);
  }, [searchParams]);

  const filteredServices = (SUPPORTED_SERVICES as readonly string[]).filter((s) => {
    const matchesSearch = (SERVICE_LABELS[s] || s).toLowerCase().includes(serviceSearch.toLowerCase());
    const matchesCategory = activeCategory === 'All' || serviceCategory[s] === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredCountries = (SUPPORTED_COUNTRIES as readonly string[]).filter((c) => {
    return (COUNTRY_LABELS[c] || c).toLowerCase().includes(countrySearch.toLowerCase());
  });

  const popularCountriesList = filteredCountries.filter((c) => popularCountries.includes(c));
  const otherCountriesList = filteredCountries.filter((c) => !popularCountries.includes(c));

  const handleServiceSelect = (s: string) => {
    setService(s);
    setStep(2);
  };

  const handleCountrySelect = async (c: string) => {
    setCountry(c);
    setCheckingPrice(true);
    try {
      const data = await apiFetch(`/orders/services/${service}/price?country=${c}`);
      setPrice(data);
    } catch {
      setPrice(null);
    } finally {
      setCheckingPrice(false);
    }
    setStep(3);
  };

  const handleBuy = async () => {
    setBuying(true);
    try {
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({ service, country }),
      });
      router.push('/dashboard/orders');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setBuying(false);
    }
  };

  const steps = [
    { num: 1, label: 'Service' },
    { num: 2, label: 'Country' },
    { num: 3, label: 'Confirm' },
  ];

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <button
              onClick={() => s.num < step && setStep(s.num)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-body-xs font-medium transition-all',
                step === s.num
                  ? 'bg-primary text-white'
                  : step > s.num
                  ? 'bg-accent/10 text-accent cursor-pointer'
                  : 'bg-elevated-secondary text-content-tertiary'
              )}
            >
              <span className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-body-xs',
                step === s.num ? 'bg-white/20' : step > s.num ? 'bg-accent/20' : 'bg-line'
              )}>
                {step > s.num ? <Check className="h-3 w-3" /> : s.num}
              </span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <div className={cn('w-8 h-px', step > s.num ? 'bg-accent' : 'bg-line')} />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Service selection */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Search 2,500+ services..."
                  value={serviceSearch}
                  onChange={(e) => setServiceSearch(e.target.value)}
                  startContent={<Search className="h-4 w-4" />}
                />
              </div>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-body-xs font-medium whitespace-nowrap transition-all',
                    activeCategory === cat
                      ? 'bg-primary text-white'
                      : 'bg-elevated-secondary text-content-secondary hover:text-content'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Services grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
              {filteredServices.map((s) => {
                const Icon = serviceIcons[s] || Globe;
                const isSelected = service === s;
                return (
                  <button
                    key={s}
                    onClick={() => handleServiceSelect(s)}
                    className={cn(
                      'card-hover rounded-xl border p-4 text-center transition-all relative',
                      isSelected
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-line bg-elevated hover:border-primary/30'
                    )}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <p className="text-body-sm font-medium text-content">{SERVICE_LABELS[s] || s}</p>
                    <p className="text-body-xs text-content-tertiary mt-0.5">From $0.50</p>
                  </button>
                );
              })}
            </div>

            {filteredServices.length === 0 && (
              <div className="text-center py-12">
                <Search className="h-8 w-8 text-content-tertiary mx-auto mb-3" />
                <p className="text-body-sm text-content-secondary">No services found for &ldquo;{serviceSearch}&rdquo;</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 2: Country selection */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-body-sm text-content-secondary">
                  Selected: <span className="font-medium text-content">{SERVICE_LABELS[service] || service}</span>
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setStep(1)} icon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </Button>
            </div>

            <Input
              placeholder="Search countries..."
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              startContent={<Search className="h-4 w-4" />}
            />

            {/* Popular countries */}
            {!countrySearch && popularCountriesList.length > 0 && (
              <div>
                <p className="text-body-xs font-medium text-content-secondary uppercase tracking-wider mb-3">Popular</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  {popularCountriesList.map((c) => (
                    <button
                      key={c}
                      onClick={() => handleCountrySelect(c)}
                      className="card-hover rounded-xl border border-line bg-elevated p-4 text-center"
                    >
                      <span className="text-2xl mb-1 block">{countryFlags[c] || '🌍'}</span>
                      <p className="text-body-xs font-medium text-content">{COUNTRY_LABELS[c] || c}</p>
                      <div className="flex items-center justify-center gap-1 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                        <span className="text-body-xs text-accent">Available</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* All countries */}
            <div>
              {!countrySearch && <p className="text-body-xs font-medium text-content-secondary uppercase tracking-wider mb-3">All Countries</p>}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {(countrySearch ? filteredCountries : otherCountriesList).map((c) => (
                  <button
                    key={c}
                    onClick={() => handleCountrySelect(c)}
                    className="card-hover rounded-xl border border-line bg-elevated p-3 text-center"
                  >
                    <span className="text-xl">{countryFlags[c] || '🌍'}</span>
                    <p className="text-body-xs font-medium text-content mt-1">{COUNTRY_LABELS[c] || c}</p>
                  </button>
                ))}
              </div>
            </div>

            {filteredCountries.length === 0 && (
              <div className="text-center py-12">
                <Globe className="h-8 w-8 text-content-tertiary mx-auto mb-3" />
                <p className="text-body-sm text-content-secondary">No countries found for &ldquo;{countrySearch}&rdquo;</p>
              </div>
            )}
          </motion.div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
            className="max-w-lg mx-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <Button variant="ghost" size="sm" onClick={() => setStep(2)} icon={<ArrowLeft className="h-4 w-4" />}>
                Back
              </Button>
            </div>

            <Card accent>
              <CardContent className="p-6 space-y-6">
                <h2 className="font-display text-heading-md font-bold text-content text-center">
                  Confirm Your Order
                </h2>

                {/* Summary */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-line">
                    <span className="text-body-sm text-content-secondary">Service</span>
                    <span className="text-body-sm font-medium text-content flex items-center gap-2">
                      {(() => { const Icon = serviceIcons[service] || Globe; return <Icon className="h-4 w-4 text-primary" />; })()}
                      {SERVICE_LABELS[service] || service}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-line">
                    <span className="text-body-sm text-content-secondary">Country</span>
                    <span className="text-body-sm font-medium text-content">
                      {countryFlags[country]} {COUNTRY_LABELS[country] || country}
                    </span>
                  </div>
                  {checkingPrice ? (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-body-sm text-content-secondary">Price</span>
                      <span className="text-body-sm text-content-tertiary animate-pulse">Checking...</span>
                    </div>
                  ) : price ? (
                    <div className="flex items-center justify-between py-2 border-b border-line">
                      <span className="text-body-sm text-content-secondary">Price</span>
                      <span className="text-heading-sm font-bold text-content">
                        ${(price.priceCents / 100).toFixed(2)}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-4 text-error">
                      <WifiOff className="h-4 w-4" />
                      <span className="text-body-sm font-medium">Service not available for this country</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-body-sm text-content-secondary">Est. delivery</span>
                    <span className="text-body-sm font-medium text-accent flex items-center gap-1">
                      <Zap className="h-3.5 w-3.5" /> &lt;30 seconds
                    </span>
                  </div>
                </div>

                {/* Wallet balance */}
                <div className="rounded-lg bg-elevated-secondary p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm text-content-secondary">Your balance</span>
                    <span className="text-body-sm font-bold text-content">
                      ${user ? (user.balanceCents / 100).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  {price && user && (price.priceCents / 100) > (user.balanceCents / 100) && (
                    <div className="mt-2 flex items-center gap-2 text-warning">
                      <span className="text-body-xs">Insufficient balance.</span>
                      <button
                        onClick={() => router.push('/dashboard/wallet')}
                        className="text-body-xs text-primary font-medium hover:underline"
                      >
                        Add funds →
                      </button>
                    </div>
                  )}
                </div>

                {/* Buy button */}
                {price?.available !== false && (
                  <Button
                    onClick={handleBuy}
                    loading={buying}
                    className="w-full"
                    size="lg"
                    disabled={user && price && (price.priceCents / 100) > (user.balanceCents / 100)}
                    icon={<Smartphone className="h-4 w-4" />}
                  >
                    {buying ? 'Purchasing...' : `Buy Number — $${price ? (price.priceCents / 100).toFixed(2) : ''}`}
                  </Button>
                )}

                <p className="text-body-xs text-content-tertiary text-center">
                  If no SMS arrives within 20 minutes, you&apos;ll get an automatic full refund.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
