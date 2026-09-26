// Shared constants and types for SimbaSMS backend
// Inlined from @simbasms/shared for Render deployment compatibility

/** Default markup percentage applied on top of provider cost */
export const DEFAULT_MARKUP_PERCENT = 30;

/** How long (ms) to wait for an SMS before marking order expired */
export const ORDER_EXPIRY_MS = 20 * 60 * 1000; // 20 minutes

/** BullMQ polling interval (ms) for checking SMS from provider */
export const SMS_POLL_INTERVAL_MS = 4000;

/** Number of consecutive provider failures before auto-switch */
export const PROVIDER_FAILURE_THRESHOLD = 3;

/** Minimum top-up amount in USD cents ($1 = 100 cents) */
export const MIN_TOPUP_CENTS = 100; // $1.00

/** Maximum top-up amount in USD cents ($5000) */
export const MAX_TOPUP_CENTS = 500000; // $5,000.00

// ─── Exchange Rates ──────────────────────────────────────────────────────────

export const EXCHANGE_RATES: Record<string, number> = {
  NGN: 1600, // 1 USD = 1600 NGN
  GHS: 15,   // 1 USD = 15 GHS
  USD: 1,
};

/** Supported deposit currencies */
export const SUPPORTED_CURRENCIES = ['NGN', 'GHS', 'USD'] as const;
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

/**
 * Convert local currency amount to USD cents
 * @param amount - Amount in local currency smallest unit (kobo/pesewas)
 * @param currency - Currency code (NGN, GHS, USD)
 * @returns Amount in USD cents
 */
export function convertToUsdCents(amount: number, currency: string): number {
  const rate = EXCHANGE_RATES[currency];
  if (!rate) {
    throw new Error(`Unsupported currency: ${currency}`);
  }

  if (currency === 'USD') {
    return Math.round(amount);
  }

  const mainUnit = amount / 100;
  const usdAmount = mainUnit / rate;
  return Math.round(usdAmount * 100);
}
