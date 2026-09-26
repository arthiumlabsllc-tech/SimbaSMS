'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingCart, ClipboardList, Wallet, Settings,
  LogOut, Menu, X, ChevronLeft, Bell, Search, Sun, Moon,
} from 'lucide-react';
import { apiFetch, getToken, clearToken } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/buy', label: 'Buy Number', icon: ShoppingCart },
  { href: '/dashboard/orders', label: 'My Orders', icon: ClipboardList },
  { href: '/dashboard/wallet', label: 'Wallet', icon: Wallet },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    apiFetch('/auth/me')
      .then(setUser)
      .catch(() => {
        clearToken();
        router.push('/login');
      })
      .finally(() => setLoading(false));
  }, []);

  // Apply dark mode to html element
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = useCallback(() => {
    clearToken();
    router.push('/login');
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center animate-pulse">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 rounded-full bg-primary"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-base dark:bg-base">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={cn(
        'fixed top-0 left-0 z-50 h-full border-r border-line bg-elevated transition-all duration-300 ease-expo-out flex flex-col',
        sidebarCollapsed ? 'w-[68px]' : 'w-64',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        {/* Logo */}
        <div className={cn(
          'flex items-center h-16 border-b border-line shrink-0',
          sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        )}>
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            {!sidebarCollapsed && (
              <span className="font-display font-bold text-lg text-content">SimbaSMS</span>
            )}
          </Link>
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="hidden lg:flex p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-elevated-secondary transition-colors"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(false)}
              className="hidden lg:flex p-1.5 rounded-lg text-content-tertiary hover:text-content hover:bg-elevated-secondary transition-colors absolute -right-3 top-5 bg-elevated border border-line rounded-full"
            >
              <ChevronLeft className="h-3 w-3 rotate-180" />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg transition-all duration-200 group relative',
                  sidebarCollapsed ? 'justify-center px-2 py-2.5' : 'px-3 py-2.5',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-content-secondary hover:text-content hover:bg-elevated-secondary'
                )}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                <item.icon className={cn('h-[18px] w-[18px] shrink-0', active && 'text-primary')} />
                {!sidebarCollapsed && (
                  <span className="text-body-sm font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className={cn(
          'border-t border-line p-3 shrink-0',
          sidebarCollapsed && 'p-2'
        )}>
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center shrink-0">
                <span className="text-body-xs font-bold text-primary">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-body-xs font-medium text-content truncate">{user.email}</p>
                <p className="text-body-xs text-content-tertiary">${(user.balanceCents / 100).toFixed(2)}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-content-tertiary hover:text-error hover:bg-error/10 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center p-2 rounded-lg text-content-tertiary hover:text-error hover:bg-error/10 transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main content area */}
      <div className={cn(
        'transition-all duration-300 ease-expo-out',
        sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-64'
      )}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 border-b border-line bg-elevated/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-lg text-content-secondary hover:text-content hover:bg-elevated-secondary transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Search */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-elevated-secondary border border-line text-content-tertiary text-body-sm w-64">
              <Search className="h-4 w-4" />
              <span>Search...</span>
              <kbd className="ml-auto text-body-xs bg-elevated border border-line rounded px-1.5 py-0.5">⌘K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg text-content-secondary hover:text-content hover:bg-elevated-secondary transition-colors"
            >
              {darkMode ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-content-secondary hover:text-content hover:bg-elevated-secondary transition-colors">
              <Bell className="h-[18px] w-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
            </button>

            {/* Balance badge */}
            <div className="hidden sm:flex">
              <Badge variant="primary" size="lg">
                <Wallet className="h-3 w-3" />
                ${(user.balanceCents / 100).toFixed(2)}
              </Badge>
            </div>

            {/* Mobile close sidebar button */}
            {sidebarOpen && (
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 rounded-lg text-content-secondary hover:text-content hover:bg-elevated-secondary transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
