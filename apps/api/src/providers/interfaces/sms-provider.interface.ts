/**
 * Unified SMS Provider Interface
 * All providers MUST implement this interface.
 * CRITICAL: Only real carrier-grade SIM numbers allowed. NO VoIP.
 */
export interface SmsProvider {
  /** Provider identifier */
  readonly name: string;

  /**
   * Get price for a service+country combination in USD
   * Returns null if not available
   */
  getPrice(service: string, country: string): Promise<number | null>;

  /**
   * Buy a number for the given service+country
   * Returns provider order ID, phone number, and expiry
   * CRITICAL: Must return real SIM numbers only
   */
  buyNumber(
    service: string,
    country: string,
  ): Promise<{
    orderId: string;
    phoneNumber: string;
    expiresAt: Date;
  }>;

  /**
   * Check if SMS has arrived for a provider order
   */
  checkSms(
    providerOrderId: string,
  ): Promise<{
    status: 'waiting' | 'received' | 'expired';
    code?: string;
    text?: string;
  }>;

  /**
   * Cancel an order and request refund from provider
   * Returns true if cancellation succeeded
   */
  cancelOrder(providerOrderId: string): Promise<boolean>;

  /**
   * Get provider account balance in USD
   */
  getBalance(): Promise<number>;
}

export interface ProviderConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface ProviderPrice {
  service: string;
  country: string;
  priceUsd: number;
  available: boolean;
}
