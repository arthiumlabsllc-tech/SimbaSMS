'use client';

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

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

  useEffect(() => {
    apiFetch('/auth/me').then(setUser);
    apiFetch('/wallet/transactions').then(setTransactions);
    apiFetch('/wallet/exchange-rates').then(setExchangeRates);
  }, []);

  // Countdown timer for crypto payment
  useEffect(() => {
    if (!cryptoPayment) return;
    
    const interval = setInterval(() => {
      const expires = new Date(cryptoPayment.expiresAt).getTime();
      const now = Date.now();
      const diff = expires - now;
      
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

  const getCurrencySymbol = (curr: string) => {
    switch (curr) {
      case 'NGN': return '₦';
      case 'GHS': return '₵';
      case 'USD': return '$';
      case 'BTC': return '₿';
      case 'USDT_TRC20': 
      case 'USDT_ERC20': return '₮';
      default: return '';
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

  const estimatedUsd = () => {
    if (!amount || !exchangeRates) return '0.00';
    const amt = parseFloat(amount);
    if (fiatCurrency === 'USD') return amt.toFixed(2);
    const rate = exchangeRates.rates[fiatCurrency];
    if (!rate) return '0.00';
    return ((amt / 100) / rate).toFixed(2);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Address copied to clipboard!');
  };

  // Crypto payment modal
  if (cryptoPayment) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Wallet</h1>
        
        <div className="bg-white p-6 rounded-xl border max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold mb-2">Send {getCryptoDisplayName(cryptoCurrency)}</h2>
            <p className="text-gray-600">
              Send exactly <span className="font-mono font-bold">{cryptoPayment.amount} {cryptoPayment.currency}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              to receive <span className="font-semibold text-green-600">${(parseFloat(amount)).toFixed(2)}</span> in your wallet
            </p>
          </div>

          <div className="text-center mb-4">
            <img 
              src={cryptoPayment.qrCode} 
              alt="Payment QR Code" 
              className="w-48 h-48 mx-auto border rounded-lg"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deposit Address
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm break-all font-mono">
                {cryptoPayment.address}
              </code>
              <button
                onClick={() => copyToClipboard(cryptoPayment.address)}
                className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm whitespace-nowrap"
              >
                Copy
              </button>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-yellow-800">Time remaining:</span>
              <span className="font-mono font-bold text-yellow-800">{timeLeft}</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Send the payment within this time. The address will expire after.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setCryptoPayment(null)}
              className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // In production, check payment status via API
                alert('Payment verification will be done automatically via webhook.');
              }}
              className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              I've Sent It
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-4 text-center">
            Payment ID: {cryptoPayment.paymentId}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Wallet</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border">
          <h2 className="text-lg font-semibold mb-4">Top Up</h2>
          <div className="mb-4">
            <div className="text-sm text-gray-600 mb-1">Current Balance</div>
            <div className="text-3xl font-bold text-orange-600">
              ${user ? (user.balanceCents / 100).toFixed(2) : '0.00'}
            </div>
          </div>

          {/* Payment Method Tabs */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setPaymentMethod('fiat')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm ${
                paymentMethod === 'fiat'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              💳 Fiat (Card/Momo)
            </button>
            <button
              onClick={() => setPaymentMethod('crypto')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm ${
                paymentMethod === 'crypto'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              ₿ Crypto (BTC/USDT)
            </button>
          </div>

          {paymentMethod === 'fiat' ? (
            <form onSubmit={handleFiatDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Currency
                </label>
                <select
                  value={fiatCurrency}
                  onChange={(e) => setFiatCurrency(e.target.value as FiatCurrency)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="NGN">Nigerian Naira (NGN)</option>
                  <option value="GHS">Ghanaian Cedi (GHS)</option>
                  <option value="USD">US Dollar (USD)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ({fiatCurrency})
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter amount"
                  required
                />
              </div>
              {amount && fiatCurrency !== 'USD' && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  You will receive: <span className="font-semibold text-green-600">${estimatedUsd()}</span>
                  <div className="text-xs text-gray-500 mt-1">
                    Exchange rate: 1 USD = {exchangeRates?.rates?.[fiatCurrency] || '...'} {fiatCurrency}
                  </div>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Processing...' : 'Deposit with Paystack'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Min: $1 | Max: $5,000. Pay with Momo, card, or bank transfer.
                {fiatCurrency !== 'USD' && ' Amount will be converted to USD.'}
              </p>
            </form>
          ) : (
            <form onSubmit={handleCryptoDeposit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cryptocurrency
                </label>
                <select
                  value={cryptoCurrency}
                  onChange={(e) => setCryptoCurrency(e.target.value as CryptoCurrency)}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="BTC">Bitcoin (BTC)</option>
                  <option value="USDT_TRC20">USDT (TRC20 - Tron)</option>
                  <option value="USDT_ERC20">USDT (ERC20 - Ethereum)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Enter USD amount"
                  required
                />
              </div>
              {amount && (
                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  You will send approximately:{' '}
                  <span className="font-semibold">
                    {cryptoCurrency === 'BTC' 
                      ? `${(parseFloat(amount) * 0.000015).toFixed(8)} BTC`
                      : `${parseFloat(amount).toFixed(2)} USDT`
                    }
                  </span>
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Generating Address...' : 'Get Deposit Address'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Min: $1 | Max: $5,000. Payment expires in 30 minutes.
              </p>
            </form>
          )}
        </div>

        <div className="bg-white rounded-xl border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold">Transaction History</h2>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="p-6 text-center text-gray-500">No transactions yet</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium">
                      {tx.type === 'DEPOSIT' ? 'Deposit' : tx.type === 'ORDER_CHARGE' ? 'Order' : 'Refund'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </div>
                    {tx.originalAmount && tx.originalCurrency && (
                      <div className="text-xs text-gray-400">
                        {['BTC', 'USDT_TRC20', 'USDT_ERC20'].includes(tx.originalCurrency)
                          ? `Crypto: ${tx.originalAmount / 100} ${getCryptoDisplayName(tx.originalCurrency)}`
                          : `Original: ${getCurrencySymbol(tx.originalCurrency)}${(tx.originalAmount / 100).toFixed(2)} ${tx.originalCurrency}`
                        }
                      </div>
                    )}
                  </div>
                  <div
                    className={`font-medium ${
                      tx.amountCents > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {tx.amountCents > 0 ? '+' : ''}${(tx.amountCents / 100).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
