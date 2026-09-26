'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Wallet, ShoppingCart, TrendingUp, CheckCircle2, ArrowRight,
  Plus, Mail, Zap, MessageSquare, Globe, Users, Clock,
  Copy, ExternalLink, ChevronRight, Sparkles,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency, formatRelativeTime, copyToClipboard } from '@/lib/utils';

const quickServices = [
  { name: 'Gmail', icon: Mail, service: 'gmail', from: '$0.50' },
  { name: 'OpenAI', icon: Zap, service: 'openai', from: '$1.00' },
  { name: 'WhatsApp', icon: MessageSquare, service: 'whatsapp', from: '$0.75' },
  { name: 'Tinder', icon: Users, service: 'tinder', from: '$0.60' },
  { name: 'Instagram', icon: Globe, service: 'instagram', from: '$0.55' },
  { name: 'Telegram', icon: MessageSquare, service: 'telegram', from: '$0.45' },
];

const statusVariant = (status: string) => {
  switch (status) {
    case 'RECEIVED': return 'success' as const;
    case 'WAITING': return 'warning' as const;
    case 'EXPIRED': return 'error' as const;
    case 'REFUNDED': return 'info' as const;
    case 'PURCHASED': return 'default' as const;
    default: return 'default' as const;
  }
};

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch('/auth/me'),
      apiFetch('/orders?limit=5'),
    ]).then(([userData, ordersData]) => {
      setUser(userData);
      setOrders(Array.isArray(ordersData) ? ordersData : []);
    }).finally(() => setLoading(false));
  }, []);

  const handleCopy = async (text: string, id: string) => {
    await copyToClipboard(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const activeOrders = orders.filter((o) => o.status === 'WAITING').length;
  const totalSpent = orders
    .filter((o) => o.status !== 'REFUNDED')
    .reduce((sum, o) => sum + (o.costCents || 0), 0);
  const successRate = orders.length > 0
    ? ((orders.filter((o) => o.status === 'RECEIVED').length / orders.length) * 100).toFixed(0)
    : '—';

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-heading-lg font-bold text-content">
            Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ''}
          </h1>
          <p className="text-body-sm text-content-secondary mt-1">
            Here&apos;s what&apos;s happening with your account
          </p>
        </div>
        <Link href="/dashboard/buy">
          <Button icon={<Plus className="h-4 w-4" />}>Buy Number</Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-primary to-primary-dark" />
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-body-xs font-medium text-content-secondary uppercase tracking-wider">Balance</span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="h-4 w-4 text-primary" />
              </div>
            </div>
            <p className="stat-number text-content">
              ${user ? (user.balanceCents / 100).toFixed(2) : '0.00'}
            </p>
            <Link href="/dashboard/wallet" className="inline-flex items-center gap-1 mt-2 text-body-xs text-primary hover:text-primary-dark font-medium transition-colors">
              Add funds <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-body-xs font-medium text-content-secondary uppercase tracking-wider">Active Orders</span>
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-4 w-4 text-warning" />
              </div>
            </div>
            <p className="stat-number text-content">{activeOrders}</p>
            <Link href="/dashboard/orders" className="inline-flex items-center gap-1 mt-2 text-body-xs text-content-secondary hover:text-content font-medium transition-colors">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-body-xs font-medium text-content-secondary uppercase tracking-wider">Total Spent</span>
              <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-info" />
              </div>
            </div>
            <p className="stat-number text-content">${(totalSpent / 100).toFixed(2)}</p>
            <p className="text-body-xs text-content-tertiary mt-2">{orders.length} orders total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-body-xs font-medium text-content-secondary uppercase tracking-wider">Success Rate</span>
              <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-accent" />
              </div>
            </div>
            <p className="stat-number text-content">
              {successRate}{successRate !== '—' ? '%' : ''}
            </p>
            <p className="text-body-xs text-content-tertiary mt-2">Across all orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick buy */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-heading-sm font-semibold text-content">Quick Buy</h2>
          <Link href="/dashboard/buy" className="text-body-xs text-primary hover:text-primary-dark font-medium transition-colors flex items-center gap-1">
            View all services <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickServices.map((s) => (
            <Link key={s.service} href={`/dashboard/buy?service=${s.service}`}>
              <div className="card-hover rounded-xl border border-line bg-elevated p-4 text-center cursor-pointer group">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-2 group-hover:bg-primary/20 transition-colors">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <p className="text-body-xs font-medium text-content">{s.name}</p>
                <p className="text-body-xs text-content-tertiary mt-0.5">From {s.from}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link href="/dashboard/orders" className="text-body-xs text-primary hover:text-primary-dark font-medium transition-colors flex items-center gap-1">
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-14 h-14 rounded-2xl bg-elevated-secondary flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="h-7 w-7 text-content-tertiary" />
              </div>
              <p className="text-body-sm font-medium text-content mb-1">No orders yet</p>
              <p className="text-body-xs text-content-secondary mb-4">Buy your first number and receive a verification code in seconds</p>
              <Link href="/dashboard/buy">
                <Button size="sm" icon={<Plus className="h-4 w-4" />}>Buy a Number</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-0 divide-y divide-border">
              {orders.map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3.5 gap-4 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-body-sm font-medium text-content truncate">
                          {order.service} — {order.country}
                        </p>
                        <Badge variant={statusVariant(order.status)} size="sm">
                          {order.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {order.phoneNumber && (
                          <button
                            onClick={() => handleCopy(order.phoneNumber, order.id)}
                            className="text-body-xs text-content-tertiary mono hover:text-content transition-colors flex items-center gap-1"
                          >
                            {order.phoneNumber}
                            {copiedId === order.id ? (
                              <CheckCircle2 className="h-3 w-3 text-accent" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        )}
                        <span className="text-body-xs text-content-tertiary">
                          {formatRelativeTime(order.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-body-sm font-medium text-content">
                      ${(order.costCents / 100).toFixed(2)}
                    </p>
                    <Link
                      href={`/dashboard/orders`}
                      className="text-body-xs text-primary hover:text-primary-dark transition-colors opacity-0 group-hover:opacity-100"
                    >
                      View →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Getting started checklist (show if new user) */}
      {orders.length === 0 && (
        <Card accent>
          <CardContent className="p-5">
            <div className="flex items-start gap-3 mb-4">
              <Sparkles className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="text-body-sm font-semibold text-content">Get started in 3 steps</h3>
                <p className="text-body-xs text-content-secondary">Complete these to start verifying</p>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Fund your wallet', done: user?.balanceCents > 0, href: '/dashboard/wallet' },
                { label: 'Buy your first number', done: orders.length > 0, href: '/dashboard/buy' },
                { label: 'Receive your first code', done: orders.some((o) => o.status === 'RECEIVED'), href: '/dashboard/orders' },
              ].map((step, i) => (
                <Link key={i} href={step.href}>
                  <div className={cn(
                    'flex items-center gap-3 p-3 rounded-lg transition-colors',
                    step.done ? 'bg-accent/5' : 'bg-elevated-secondary hover:bg-elevated-secondary/80'
                  )}>
                    <div className={cn(
                      'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
                      step.done ? 'bg-accent' : 'border border-line text-content-tertiary'
                    )}>
                      {step.done ? (
                        <CheckCircle2 className="h-4 w-4 text-white" />
                      ) : (
                        <span className="text-body-xs font-medium">{i + 1}</span>
                      )}
                    </div>
                    <span className={cn(
                      'text-body-sm flex-1',
                      step.done ? 'text-content-tertiary line-through' : 'text-content font-medium'
                    )}>
                      {step.label}
                    </span>
                    {!step.done && <ArrowRight className="h-4 w-4 text-content-tertiary" />}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
