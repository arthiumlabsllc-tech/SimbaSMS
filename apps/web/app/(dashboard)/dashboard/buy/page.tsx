'use client';

import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { SUPPORTED_SERVICES, SUPPORTED_COUNTRIES } from '@simbasms/shared';

export default function BuyPage() {
  const [service, setService] = useState('gmail');
  const [country, setCountry] = useState('NG');
  const [price, setPrice] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState(false);

  const fetchPrice = async () => {
    setLoading(true);
    try {
      const data = await apiFetch(`/orders/services/${service}/price?country=${country}`);
      setPrice(data);
    } catch (err) {
      setPrice(null);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async () => {
    setBuying(true);
    try {
      const order = await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify({ service, country }),
      });
      alert(`Order created! Phone: ${order.phoneNumber || 'Pending'}`);
      window.location.href = `/dashboard/orders`;
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Purchase failed');
    } finally {
      setBuying(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Buy Number</h1>

      <div className="bg-white p-6 rounded-xl border max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Service
            </label>
            <select
              value={service}
              onChange={(e) => setService(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              {SUPPORTED_SERVICES.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              {SUPPORTED_COUNTRIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchPrice}
            disabled={loading}
            className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
          >
            {loading ? 'Checking...' : 'Check Price'}
          </button>

          {price && (
            <div className="bg-gray-50 p-4 rounded-lg">
              {price.available ? (
                <>
                  <div className="text-lg font-semibold">
                    Price: ${(price.priceCents / 100).toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-500">
                    Provider: {price.providerName}
                  </div>
                  <button
                    onClick={handleBuy}
                    disabled={buying}
                    className="w-full mt-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
                  >
                    {buying ? 'Purchasing...' : 'Buy Now'}
                  </button>
                </>
              ) : (
                <div className="text-red-600">
                  Service not available for this country
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
