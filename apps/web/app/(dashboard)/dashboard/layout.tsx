'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiFetch, getToken, clearToken } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🦁</span>
            <span className="text-xl font-bold text-orange-600">SimbaSMS</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/dashboard/wallet" className="text-gray-600 hover:text-gray-900">
              Wallet
            </Link>
            <Link href="/dashboard/buy" className="text-gray-600 hover:text-gray-900">
              Buy Number
            </Link>
            <Link href="/dashboard/orders" className="text-gray-600 hover:text-gray-900">
              Orders
            </Link>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Balance: ${(user.balanceCents / 100).toFixed(2)}
              </span>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
