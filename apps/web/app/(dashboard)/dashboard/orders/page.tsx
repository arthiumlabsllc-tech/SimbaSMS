'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/orders')
      .then(setOrders)
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId: string) => {
    if (!confirm('Cancel this order?')) return;
    try {
      await apiFetch(`/orders/${orderId}/cancel`, { method: 'POST' });
      setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: 'REFUNDED' } : o)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Cancel failed');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders</h1>

      <div className="bg-white rounded-xl border">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders yet</div>
        ) : (
          <div className="divide-y">
            {orders.map((order) => (
              <div key={order.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <span className="font-medium">{order.service}</span>
                    <span className="text-gray-500"> - {order.country}</span>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      order.status === 'RECEIVED'
                        ? 'bg-green-100 text-green-700'
                        : order.status === 'WAITING'
                          ? 'bg-yellow-100 text-yellow-700'
                          : order.status === 'EXPIRED'
                            ? 'bg-red-100 text-red-700'
                            : order.status === 'REFUNDED'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  {order.phoneNumber && (
                    <div>Phone: {order.phoneNumber}</div>
                  )}
                  {order.smsCode && (
                    <div className="font-mono text-lg text-green-600">
                      Code: {order.smsCode}
                    </div>
                  )}
                  <div>Cost: ${(order.costCents / 100).toFixed(2)}</div>
                  <div>Expires: {new Date(order.expiresAt).toLocaleString()}</div>
                </div>
                {order.status === 'WAITING' && (
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="mt-2 text-sm text-red-600 hover:underline"
                  >
                    Cancel & Refund
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
