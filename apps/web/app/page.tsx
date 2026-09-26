import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">🦁</span>
            <span className="text-2xl font-bold text-orange-600">SimbaSMS</span>
          </div>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-orange-600 hover:text-orange-700 font-medium"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            SMS Verification Made Simple
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Get real phone numbers for SMS verification. Gmail, OpenAI, WhatsApp, Tinder and more.
            No VoIP - only real carrier-grade SIM numbers.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium text-lg"
            >
              Start Now
            </Link>
            <Link
              href="/login"
              className="px-8 py-3 border-2 border-orange-600 text-orange-600 rounded-lg hover:bg-orange-50 font-medium text-lg"
            >
              Login
            </Link>
          </div>
        </div>

        <div className="mt-20 grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-semibold mb-2">Fund Your Wallet</h3>
            <p className="text-gray-600">
              Top up with Paystack using Momo, debit card, or bank transfer.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-xl font-semibold mb-2">Buy a Number</h3>
            <p className="text-gray-600">
              Choose your service and country. Get a real SIM number instantly.
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <div className="text-4xl mb-4">✅</div>
            <h3 className="text-xl font-semibold mb-2">Receive SMS</h3>
            <p className="text-gray-600">
              Get verification codes in real-time via WebSocket. Copy and use.
            </p>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 text-center text-gray-500">
        <p>&copy; 2026 SimbaSMS. All rights reserved.</p>
      </footer>
    </div>
  );
}
