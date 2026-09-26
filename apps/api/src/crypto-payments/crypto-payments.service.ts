import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

export interface CryptoPaymentRequest {
  userId: string;
  amountCents: number;
  currency: 'BTC' | 'USDT' | 'USDT_TRC20' | 'USDT_ERC20';
}

export interface CryptoPaymentResponse {
  paymentId: string;
  address: string;
  amount: string;
  currency: string;
  expiresAt: string;
  qrCode: string;
}

export interface CryptoPaymentStatus {
  paymentId: string;
  status: 'pending' | 'confirming' | 'completed' | 'expired';
  amountReceived?: string;
  confirmations?: number;
  txHash?: string;
}

@Injectable()
export class CryptoPaymentsService {
  private readonly logger = new Logger(CryptoPaymentsService.name);
  private readonly apiKey: string;
  private readonly ipnSecret: string;
  private readonly baseUrl: string;

  // Demo addresses (in production, use payment processor or generate unique ones)
  private readonly depositAddresses: Record<string, string> = {
    BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    USDT_TRC20: 'TR7NHqjeKQxGWDiLXwBz8fHxv9KjYfQZsM',
    USDT_ERC20: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  };

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('NOWPAYMENTS_API_KEY') || '';
    this.ipnSecret = this.configService.get<string>('NOWPAYMENTS_IPN_SECRET') || '';
    this.baseUrl = this.configService.get<string>('NOWPAYMENTS_BASE_URL') || 'https://api.nowpayments.io/v1';
  }

  /**
   * Create a crypto payment request
   * In production, integrate with NOWPayments, CoinGate, or similar
   */
  async createPayment(request: CryptoPaymentRequest): Promise<CryptoPaymentResponse> {
    const { userId, amountCents, currency } = request;

    // Generate unique payment ID
    const paymentId = `crypto_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    // Convert USD cents to crypto amount
    const cryptoAmount = await this.convertUsdToCrypto(amountCents, currency);

    // Get deposit address
    const address = this.getDepositAddress(currency);

    // Payment expires in 30 minutes
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    this.logger.log(
      `Created crypto payment ${paymentId}: ${cryptoAmount} ${currency} for user ${userId} ($${(amountCents / 100).toFixed(2)})`,
    );

    return {
      paymentId,
      address,
      amount: cryptoAmount,
      currency: this.getCurrencySymbol(currency),
      expiresAt: expiresAt.toISOString(),
      qrCode: this.generateQrCode(address, cryptoAmount, currency),
    };
  }

  /**
   * Check payment status
   */
  async checkPaymentStatus(paymentId: string): Promise<CryptoPaymentStatus> {
    // In production, check with payment processor or blockchain
    // For demo, return pending status
    return {
      paymentId,
      status: 'pending',
    };
  }

  /**
   * Verify IPN (Instant Payment Notification) webhook
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.ipnSecret) {
      this.logger.warn('NOWPAYMENTS_IPN_SECRET not configured');
      return false;
    }

    const hmac = crypto.createHmac('sha512', this.ipnSecret);
    hmac.update(payload);
    const computedSignature = hmac.digest('hex');
    
    return computedSignature === signature;
  }

  /**
   * Handle completed crypto payment
   */
  async handlePaymentCompleted(
    paymentId: string,
    amountReceived: string,
    txHash: string,
  ): Promise<{ userId: string; amountCents: number } | null> {
    // In production, look up payment and credit user wallet
    this.logger.log(
      `Crypto payment ${paymentId} completed: ${amountReceived}, tx: ${txHash}`,
    );
    
    // Return payment info for wallet crediting
    return null; // Placeholder
  }

  /**
   * Get supported cryptocurrencies
   */
  getSupportedCurrencies() {
    return [
      { code: 'BTC', name: 'Bitcoin', network: 'Bitcoin' },
      { code: 'USDT_TRC20', name: 'Tether', network: 'TRC20 (Tron)' },
      { code: 'USDT_ERC20', name: 'Tether', network: 'ERC20 (Ethereum)' },
    ];
  }

  /**
   * Get current exchange rates for crypto
   */
  async getCryptoRates() {
    // In production, fetch from exchange rate API
    return {
      BTC: { rate: 0.000015, minAmount: 0.0001 }, // 1 USD = 0.000015 BTC (approx)
      USDT_TRC20: { rate: 1, minAmount: 1 }, // 1 USD = 1 USDT
      USDT_ERC20: { rate: 1, minAmount: 10 }, // 1 USD = 1 USDT (higher min for gas)
    };
  }

  private async convertUsdToCrypto(amountCents: number, currency: string): Promise<string> {
    const usdAmount = amountCents / 100;
    const rates = await this.getCryptoRates();
    
    const rateData = rates[currency as keyof typeof rates];
    if (!rateData) {
      throw new Error(`Unsupported currency: ${currency}`);
    }

    const cryptoAmount = usdAmount * rateData.rate;
    
    // Format with appropriate decimals
    if (currency === 'BTC') {
      return cryptoAmount.toFixed(8);
    }
    return cryptoAmount.toFixed(2);
  }

  private getDepositAddress(currency: string): string {
    const address = this.depositAddresses[currency];
    if (!address) {
      throw new Error(`No deposit address for ${currency}`);
    }
    return address;
  }

  private getCurrencySymbol(currency: string): string {
    switch (currency) {
      case 'BTC': return 'BTC';
      case 'USDT_TRC20': return 'USDT';
      case 'USDT_ERC20': return 'USDT';
      default: return currency;
    }
  }

  private generateQrCode(address: string, amount: string, currency: string): string {
    // Generate QR code data URI
    // In production, use a QR code library like 'qrcode'
    let qrData = '';
    
    if (currency === 'BTC') {
      qrData = `bitcoin:${address}?amount=${amount}`;
    } else if (currency.startsWith('USDT')) {
      // USDT doesn't have a standard URI scheme, just use address
      qrData = address;
    } else {
      qrData = address;
    }

    // Return placeholder - in production, generate actual QR code image
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
  }
}
