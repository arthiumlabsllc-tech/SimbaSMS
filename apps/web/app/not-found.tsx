import Link from 'next/link';
import { ArrowRight, Smartphone, MessageSquare } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-base">
      {/* Background mesh */}
      <div className="absolute inset-0 bg-mesh" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,166,35,0.08)_0%,transparent_60%)]" />

      {/* Floating phone mockups */}
      <div className="absolute top-20 left-10 opacity-10 rotate-12 hidden sm:block">
        <div className="w-24 h-40 rounded-xl border border-line bg-elevated" />
      </div>
      <div className="absolute bottom-20 right-10 opacity-10 -rotate-12 hidden sm:block">
        <div className="w-20 h-32 rounded-xl border border-line bg-elevated" />
      </div>

      <div className="relative z-10 text-center px-4 max-w-lg mx-auto">
        {/* 404 number */}
        <h1 className="font-display text-display-xl font-bold text-gradient-primary mb-4">
          404
        </h1>

        <h2 className="font-display text-heading-lg font-bold text-content mb-3">
          This number doesn&apos;t exist.
        </h2>

        <p className="text-body-md text-content-secondary mb-8">
          The page you&apos;re looking for has expired or never existed. Maybe it was a virtual number all along.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/dashboard">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-primary-dark text-white font-medium shadow-glow hover:shadow-lg transition-all duration-250 hover:-translate-y-0.5">
              Back to Dashboard
              <ArrowRight className="h-4 w-4" />
            </button>
          </Link>
          <Link href="/dashboard/buy">
            <button className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-primary text-primary font-medium hover:bg-primary hover:text-white transition-all duration-250">
              Buy a Number
              <MessageSquare className="h-4 w-4" />
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
