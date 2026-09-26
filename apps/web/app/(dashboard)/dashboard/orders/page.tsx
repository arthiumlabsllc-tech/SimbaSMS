'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Copy, CheckCircle2, Clock, XCircle, RefreshCw,
  ShoppingCart, ArrowRight, ExternalLink, Filter,
  MessageSquare, ChevronDown,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatCurrency, formatRelativeTime, copyToClipboard } from '@/lib/utils';

type FilterTab = 'all' | 'active' | 'completed' | 'expired' | 'refunded';

const tabs: { key: FilterTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'expired', label: 'Expired' },
  { key: 'refunded', label: 'Refunded' },
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

const statusIcon = (status: string) => {
  switch (status) {
    case 'RECEIVED': return CheckCircle2;
    case 'WAITING': return Clock;
    case 'EXPIRED': return XCircle;
    case 'REFUNDED': return RefreshCw;
    default: return Clock;
  }
};

const matchesFilter = (order: any, filter: FilterTab) => {
  switch (filter) {
    case 'all': return true;
    case 'active': return order.status === 'WAITING' || order.status === 'PURCHASED';
    case 'completed': return order.status === 'RECEIVED';
    case 'expired': return order.status === 'EXPIRED';
    case 'refunded': return order.status === 'REFUNDED';
    default: return true;
  }
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/orders')
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId: string) => {
    try {
      await apiFetch(`/orders/${orderId}/cancel`, { method: 'POST' });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: 'REFUNDED' } : o)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Cancel failed');
    }
  };

  const handleCopy = async (text: string, type: 'id' | 'phone', id: string) => {
    await copyToClipboard(text);
    if (type === 'id') {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      setCopiedPhone(id);
      setTimeout(() => setCopiedPhone(null), 2000);
    }
  };

  const filteredOrders = orders
    .filter((o) => matchesFilter(o, activeFilter))
    .filter((o) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        o.service?.toLowerCase().includes(q) ||
        o.country?.toLowerCase().includes(q) ||
        o.phoneNumber?.includes(q) ||
        o.id?.toLowerCase().includes(q)
      );
    });

  const filterCounts: Record<FilterTab, number> = {
    all: orders.length,
    active: orders.filter((o) => o.status === 'WAITING' || o.status === 'PURCHASED').length,
    completed: orders.filter((o) => o.status === 'RECEIVED').length,
    expired: orders.filter((o) => o.status === 'EXPIRED').length,
    refunded: orders.filter((o) => o.status === 'REFUNDED').length,
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-8 w-20" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-heading-lg font-bold text-content">My Orders</h1>
          <p className="text-body-sm text-content-secondary mt-1">{orders.length} total orders</p>
        </div>
        <Link href="/dashboard/buy">
          <Button icon={<ShoppingCart className="h-4 w-4" />}>New Order</Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-body-xs font-medium whitespace-nowrap transition-all',
                activeFilter === tab.key
                  ? 'bg-primary text-white'
                  : 'bg-elevated-secondary text-content-secondary hover:text-content'
              )}
            >
              {tab.label}
              {filterCounts[tab.key] > 0 && (
                <span className={cn(
                  'text-body-xs px-1.5 py-0.5 rounded-full',
                  activeFilter === tab.key ? 'bg-white/20' : 'bg-border/50'
                )}>
                  {filterCounts[tab.key]}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="sm:ml-auto sm:w-64">
          <Input
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            startContent={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Orders list */}
      {filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-elevated-secondary flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="h-8 w-8 text-content-tertiary" />
            </div>
            <h3 className="text-body-md font-semibold text-content mb-1">
              {search ? 'No matching orders' : 'No orders yet'}
            </h3>
            <p className="text-body-sm text-content-secondary mb-4">
              {search
                ? `No orders match "${search}"`
                : 'Buy your first number and receive a verification code in seconds'}
            </p>
            {!search && (
              <Link href="/dashboard/buy">
                <Button icon={<ShoppingCart className="h-4 w-4" />}>Buy a Number</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredOrders.map((order) => {
              const StatusIcon = statusIcon(order.status);
              return (
                <motion.div
                  key={order.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="card-hover">
                    <CardContent className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Left: Order info */}
                        <div className="flex items-start gap-3 min-w-0">
                          <div className={cn(
                            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
                            order.status === 'RECEIVED' ? 'bg-accent/10' :
                            order.status === 'WAITING' ? 'bg-warning/10' :
                            order.status === 'EXPIRED' ? 'bg-error/10' :
                            'bg-elevated-secondary'
                          )}>
                            <StatusIcon className={cn(
                              'h-5 w-5',
                              order.status === 'RECEIVED' ? 'text-accent' :
                              order.status === 'WAITING' ? 'text-warning' :
                              order.status === 'EXPIRED' ? 'text-error' :
                              'text-content-tertiary'
                            )} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-body-sm font-semibold text-content capitalize">
                                {order.service}
                              </span>
                              <span className="text-body-xs text-content-tertiary">—</span>
                              <span className="text-body-sm text-content-secondary">{order.country}</span>
                              <Badge variant={statusVariant(order.status)} size="sm">
                                {order.status}
                              </Badge>
                            </div>

                            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                              {order.phoneNumber && (
                                <button
                                  onClick={() => handleCopy(order.phoneNumber, 'phone', order.id)}
                                  className="text-body-xs mono text-content-secondary hover:text-content transition-colors flex items-center gap-1"
                                >
                                  {order.phoneNumber}
                                  {copiedPhone === order.id ? (
                                    <CheckCircle2 className="h-3 w-3 text-accent" />
                                  ) : (
                                    <Copy className="h-3 w-3" />
                                  )}
                                </button>
                              )}
                              {order.smsCode && (
                                <span className="text-body-xs mono font-bold text-accent">
                                  Code: {order.smsCode}
                                </span>
                              )}
                              <span className="text-body-xs text-content-tertiary">
                                {formatRelativeTime(order.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right: Cost + actions */}
                        <div className="flex items-center gap-3 sm:shrink-0">
                          <span className="text-body-sm font-semibold text-content">
                            ${(order.costCents / 100).toFixed(2)}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {order.status === 'WAITING' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancel(order.id)}
                                className="text-error hover:text-error hover:bg-error/10"
                              >
                                Cancel
                              </Button>
                            )}
                            <Link href="/dashboard/orders">
                              <Button variant="secondary" size="sm">
                                View
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
