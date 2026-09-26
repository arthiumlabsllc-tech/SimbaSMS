'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Wallet, CreditCard, Bitcoin, ArrowUpRight, ArrowDownLeft,
  Copy, CheckCircle2, Clock, QrCode, Shield, AlertTriangle,
  Download, Filter, RefreshCw,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils';

type PaymentMethod = 'fiat' | 'crypto';
type FiatCurrency = 'NGN' | 'GHS' | 'USD';
type CryptoCurrency = 'BTC' | 'USDT_TRC20' | 'USDT_ERC20';

interface CryptoPayment {
  paymentId: string;
  address: string;
  amount: string;
  currency: string;
  expiresAt: string;
  qrCode: string;
}

const quickAmounts = [5, 10, 25, 50, 100];

const txTypeLabel = (type: string) => {
  switch (type) {
    case 'DEPOSIT': return 'Deposit';
    case 'ORDER_CHARGE': return 'Order';
    case 'REFUND': return 'Refund';
    default: return type;
  }
};

const txTypeIcon = (type: string) => {
  switch (type) {
    case 'DEPOSIT': return ArrowDownLeft;
    case 'ORDER_CHARGE': return ArrowUpRight;
    case 'REFUND': return RefreshCw;
    default: return ArrowDownLeft;
  }
};

const getCryptoDisplayName = (curr: string) => {
  switch (curr) {
    case 'BTC': return 'Bitcoin';
    case 'USDT_TRC20': return 'USDT (TRC20)';
    case 'USDT_ERC20': return 'USDT (ERC20)';
    default: return curr;
  }
};

export default function WalletPage() {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('fiat');
  const [fiatCurrency, setFiatCurrency] = useState<FiatCurrency>('NGN');
  const [cryptoCurrency, setCryptoCurrency] = useState<CryptoCurrency>('USDT_TRC20');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [exchangeRates, setExchangeRates] = useState<any>(null);
  const [cryptoPayment, setCryptoPayment] = useState<CryptoPayment | null>(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [copiedAddr, setCopiedAddr] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch('/auth/me'),
      apiFetch('/wallet/transactions'),
      apiFetch('/wallet/exchange-rates'),
    ]).then(([userData, txData, rates]) => {
      setUser(userData);
      setTransactions(Array.isArray(txData) ? txData : []);
      setExchangeRates(rates);
    }).finally(() => setPageLoading(false));
  }, []);

  // Countdown timer for crypto payment
  useEffect(() => {
    if (!cryptoPayment) return;
    const interval = setInterval(() => {
      const expires = new Date(cryptoPayment.expiresAt).getTime();
      const diff = expires - Date.now();
      if (diff <= 0) {
        setTimeLeft('Expired');
        setCryptoPayment(null);
        return;
      }
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    return () => clearInterval(interval);
  }, [cryptoPayment]);

  const handleFiatDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const amountCents = Math.round(parseFloat(amount) * 100);
      const data = await apiFetch('/wallet/deposit', {
        method: 'POST',
        body: JSON.stringify({ amountCents, currency: fiatCurrency }),
      });
      window.location.href = data.authorization_url;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleCryptoDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const amountCents = Math.round(parseFloat(amount) * 100);
      const data = await apiFetch('/crypto/deposit', {
        method: 'POST',
        body: JSON.stringify({ amountCents, currency: cryptoCurrency }),
      });
      setCryptoPayment(data);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const estimatedUsd = () => {
    if (!amount || !exchangeRates) return '0.00';
    const amt = parseFloat(amount);
    if (fiatCurrency === 'USD') return amt.toFixed(2);
    const rate = exchangeRates.rates[fiatCurrency];
    if (!rate) return '0.00';
    return ((amt / 100) / rate).toFixed(2);
  };

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'NGN': return '₦';
      case 'GHS': return '₵';
      case 'USD': return '$';
      default: return '';
    }
  };

  const copyAddress = async () => {
    if (!cryptoPayment) return;
    await navigator.clipboard.writeText(cryptoPayment.address);
    setCopiedAddr(true);
    setTimeout(() => setCopiedAddr(false), 2000);
  };

  // Crypto payment modal overlay
  if (cryptoPayment) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-heading-lg font-bold text-content">Wallet</h1>
          <Button variant="ghost" size="sm" onClick={() => setCryptoPayment(null)}>
            ← Back to Wallet
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <Card accent>
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Bitcoin className="h-6 w-6 text-primary" />
                </div>
                <h2 className="font-display text-heading-sm font-bold text-content">
                  Send {getCryptoDisplayName(cryptoCurrency)}
                </h2>
                <p className="text-body-sm text-content-secondary mt-1">
                  Send exactly <span className="mono font-bold text-content">{cryptoPayment.amount} {cryptoPayment.currency}</span>
                </p>
              </div>

              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 rounded-xl bg-white border border-line">
                  <img
                    src={cryptoPayment.qrCode}
                    alt="Payment QR Code"
                    className="w-44 h-44"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-body-xs font-medium text-content-secondary mb-1.5 uppercase tracking-wider">
                  Deposit Address
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-3 py-2.5 rounded-lg bg-elevated-secondary border border-line mono text-body-xs text-content break-all">
                    {cryptoPayment.address}
                  </div>
                  <Button variant="secondary" size="sm" onClick={copyAddress}>
                    {copiedAddr ? <CheckCircle2 className="h-4 w-4 text-accent" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Timer */}
              <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-warning/10 border border-warning/20">
                <Clock className="h-5 w-5 text-warning shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-body-sm font-medium text-warning">Time remaining</span>
                    <span className="mono text-body-sm font-bold text-warning">{timeLeft}</span>
                  </div>
                  <p className="text-body-xs text-content-tertiary mt-0.5">
                    Send the payment within this time frame
                  </p>
                </div>
              </div>

              {/* You'll receive */}
              <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-accent/10 border border-accent/20">
                <span className="text-body-sm text-content-secondary">You&apos;ll receive</span>
                <span className="text-body-md font-bold text-accent">${parseFloat(amount).toFixed(2)}</span>
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" className="flex-1" onClick={() => setCryptoPayment(null)}>
                  Cancel
                </Button>
                <Button variant="success" className="flex-1">
                  I&apos;ve Sent It
                </Button>
              </div>

              <p className="text-body-xs text-content-tertiary text-center">
                Payment ID: <span className="mono">{cryptoPayment.paymentId}</span>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (pageLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-48" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="font-display text-heading-lg font-bold text-content">Wallet</h1>
      </div>

      {/* Balance card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-accent" />
        <CardContent className="relative p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-body-xs font-medium text-content-secondary uppercase tracking-wider mb-1">Current Balance</p>
              <p className="font-display text-display-sm sm:text-display-md font-bold text-content">
                ${user ? (user.balanceCents / 100).toFixed(2) : '0.00'}
              </p>
              <p className="text-body-xs text-content-tertiary mt-1">
                Last updated {user?.updatedAt ? formatRelativeTime(user.updatedAt) : 'just now'}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="lg" icon={<CreditCard className="h-4 w-4" />}>
                Add Funds
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Deposit form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-primary" />
              Top Up
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Payment method tabs */}
            <div className="flex gap-2">
              <button
                onClick={() => setPaymentMethod('fiat')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-body-sm font-medium transition-all',
                  paymentMethod === 'fiat'
                    ? 'bg-primary text-white shadow-glow'
                    : 'bg-elevated-secondary text-content-secondary hover:text-content'
                )}
              >
                <CreditCard className="h-4 w-4" />
                Fiat
              </button>
              <button
                onClick={() => setPaymentMethod('crypto')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg text-body-sm font-medium transition-all',
                  paymentMethod === 'crypto'
                    ? 'bg-primary text-white shadow-glow'
                    : 'bg-elevated-secondary text-content-secondary hover:text-content'
                )}
              >
                <Bitcoin className="h-4 w-4" />
                Crypto
              </button>
            </div>

            {paymentMethod === 'fiat' ? (
              <form onSubmit={handleFiatDeposit} className="space-y-4">
                {/* Currency selector */}
                <div>
                  <label className="block text-body-xs font-medium text-content-secondary mb-2 uppercase tracking-wider">
                    Payment Currency
                  </label>
                  <div className="flex gap-2">
                    {(['NGN', 'GHS', 'USD'] as FiatCurrency[]).map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setFiatCurrency(c)}
                        className={cn(
                          'flex-1 py-2 px-3 rounded-lg text-body-xs font-medium transition-all text-center',
                          fiatCurrency === c
                            ? 'bg-primary/10 text-primary border border-primary/30'
                            : 'bg-elevated-secondary text-content-secondary hover:text-content border border-transparent'
                        )}
                      >
                        {getCurrencySymbol(c)} {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount input */}
                <div>
                  <label className="block text-body-xs font-medium text-content-secondary mb-2 uppercase tracking-wider">
                    Amount ({fiatCurrency})
                  </label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    startContent={<span className="text-body-sm font-medium">{getCurrencySymbol(fiatCurrency)}</span>}
                    min="1"
                    step="0.01"
                    required
                  />
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2 flex-wrap">
                  {quickAmounts.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAmount(String(a))}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-body-xs font-medium transition-all',
                        amount === String(a)
                          ? 'bg-primary text-white'
                          : 'bg-elevated-secondary text-content-secondary hover:text-content'
                      )}
                    >
                      ${a}
                    </button>
                  ))}
                </div>

                {/* USD estimate */}
                {amount && fiatCurrency !== 'USD' && (
                  <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-accent/10 border border-accent/20">
                    <span className="text-body-sm text-content-secondary">You&apos;ll receive</span>
                    <span className="text-body-sm font-bold text-accent">${estimatedUsd()} USD</span>
                  </div>
                )}

                <Button type="submit" loading={loading} className="w-full" size="lg">
                  {loading ? 'Processing...' : 'Deposit with Paystack'}
                </Button>

                <p className="text-body-xs text-content-tertiary text-center">
                  Min: $1 | Max: $5,000. Pay with Momo, card, or bank transfer.
                </p>
              </form>
            ) : (
              <form onSubmit={handleCryptoDeposit} className="space-y-4">
                {/* Crypto selector */}
                <div>
                  <label className="block text-body-xs font-medium text-content-secondary mb-2 uppercase tracking-wider">
                    Cryptocurrency
                  </label>
                  <div className="flex gap-2">
                    {([
                      { value: 'USDT_TRC20' as CryptoCurrency, label: 'USDT', sub: 'TRC20' },
                      { value: 'USDT_ERC20' as CryptoCurrency, label: 'USDT', sub: 'ERC20' },
                      { value: 'BTC' as CryptoCurrency, label: 'BTC', sub: 'Bitcoin' },
                    ]).map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => setCryptoCurrency(c.value)}
                        className={cn(
                          'flex-1 py-2 px-3 rounded-lg text-body-xs font-medium transition-all text-center',
                          cryptoCurrency === c.value
                            ? 'bg-primary/10 text-primary border border-primary/30'
                            : 'bg-elevated-secondary text-content-secondary hover:text-content border border-transparent'
                        )}
                      >
                        <p>{c.label}</p>
                        <p className="text-body-xs opacity-60">{c.sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-body-xs font-medium text-content-secondary mb-2 uppercase tracking-wider">
                    Amount (USD)
                  </label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    startContent={<span className="text-body-sm font-medium">$</span>}
                    min="1"
                    step="0.01"
                    required
                  />
                </div>

                {/* Quick amounts */}
                <div className="flex gap-2 flex-wrap">
                  {quickAmounts.map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAmount(String(a))}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-body-xs font-medium transition-all',
                        amount === String(a)
                          ? 'bg-primary text-white'
                          : 'bg-elevated-secondary text-content-secondary hover:text-content'
                      )}
                    >
                      ${a}
                    </button>
                  ))}
                </div>

                {/* Estimate */}
                {amount && (
                  <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-accent/10 border border-accent/20">
                    <span className="text-body-sm text-content-secondary">You&apos;ll send</span>
                    <span className="text-body-sm font-bold text-accent">
                      {cryptoCurrency === 'BTC'
                        ? `${(parseFloat(amount) * 0.000015).toFixed(8)} BTC`
                        : `${parseFloat(amount).toFixed(2)} USDT`}
                    </span>
                  </div>
                )}

                <Button type="submit" loading={loading} className="w-full" size="lg">
                  {loading ? 'Generating...' : 'Get Deposit Address'}
                </Button>

                <p className="text-body-xs text-content-tertiary text-center">
                  Min: $1 | Max: $5,000. Payment expires in 30 minutes.
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Transaction history */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <ArrowDownLeft className="h-5 w-5 text-primary" />
              Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-xl bg-elevated-secondary flex items-center justify-center mx-auto mb-3">
                  <Wallet className="h-6 w-6 text-content-tertiary" />
                </div>
                <p className="text-body-sm font-medium text-content mb-1">No transactions yet</p>
                <p className="text-body-xs text-content-secondary">Your deposit history will appear here</p>
              </div>
            ) : (
              <div className="space-y-0 divide-y divide-border max-h-[400px] overflow-y-auto">
                {transactions.map((tx) => {
                  const TxIcon = txTypeIcon(tx.type);
                  const isPositive = tx.amountCents > 0;
                  return (
                    <div key={tx.id} className="flex items-center justify-between py-3.5 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                          isPositive ? 'bg-accent/10' : 'bg-error/10'
                        )}>
                          <TxIcon className={cn('h-4 w-4', isPositive ? 'text-accent' : 'text-error')} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-body-sm font-medium text-content">
                            {txTypeLabel(tx.type)}
                          </p>
                          <p className="text-body-xs text-content-tertiary">
                            {formatRelativeTime(tx.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={cn(
                          'text-body-sm font-semibold',
                          isPositive ? 'text-accent' : 'text-content'
                        )}>
                          {isPositive ? '+' : ''}${(tx.amountCents / 100).toFixed(2)}
                        </p>
                        {tx.originalAmount && tx.originalCurrency && (
                          <p className="text-body-xs text-content-tertiary">
                            {getCryptoDisplayName(tx.originalCurrency)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
