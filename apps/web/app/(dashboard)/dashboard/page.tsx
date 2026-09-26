'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    apiFetch('/auth/me').then(setUser);
    apiFetch('/orders?limit=5').then(setOrders);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl border">
          <div className="text-sm text-gray-600 mb-1">Balance</div>
          <div className="text-2xl font-bold">
            ${user ? (user.balanceCents / 100).toFixed(2) : '0.00'}
          </div>
          <Link
            href="/dashboard/wallet"
            className="text-orange-600 text-sm hover:underline mt-2 inline-block"
          >
            Top up →
          </Link>
        </div>
        <div className="bg-white p-6 rounded-xl border">
          <div className="text-sm text-gray-600 mb-1">Active Orders</div>
          <div className="text-2xl font-bold">
            {orders.filter((o) => o.status === 'WAITING').length}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border">
          <div className="text-sm text-gray-600 mb-1">Total Orders</div>
          <div className="text-2xl font-bold">{orders.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link
            href="/dashboard/orders"
            className="text-orange-600 text-sm hover:underline"
          >
            View all →
          </Link>
        </div>
        <div className="divide-y">
          {orders.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No orders yet</div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">
                    {order.service} - {order.country}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div
                  className={`px-2 py-1 rounded text-sm ${
                    order.status === 'RECEIVED'
                      ? 'bg-green-100 text-green-700'
                      : order.status === 'WAITING'
                        ? 'bg-yellow-100 text-yellow-700'
                        : order.status === 'EXPIRED'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {order.status}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
