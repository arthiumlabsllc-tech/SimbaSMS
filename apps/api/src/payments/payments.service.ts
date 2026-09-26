import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private readonly secretKey: string;
  private readonly webhookSecret: string;
  private readonly baseUrl = 'https://api.paystack.co';

  constructor(private readonly configService: ConfigService) {
    this.secretKey = this.configService.get<string>('PAYSTACK_SECRET_KEY') || '';
    this.webhookSecret =
      this.configService.get<string>('PAYSTACK_WEBHOOK_SECRET') || '';
  }

  /**
   * Initialize a Paystack transaction
   * @param email - User email
   * @param amount - Amount in local currency smallest unit (kobo/pesewas) or USD cents
   * @param currency - Currency code (NGN, GHS, USD)
   * Returns authorization_url for user redirect
   */
  async initializeTransaction(email: string, amount: number, currency = 'NGN') {
    // Paystack expects specific currency codes
    const paystackCurrency = currency === 'USD' ? 'USD' : currency;
    
    const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount,
        currency: paystackCurrency,
        channels: ['card', 'mobile_money', 'bank_transfer'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Paystack initialize failed: ${errorText}`);
      throw new Error('Payment initialization failed');
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Verify a Paystack transaction
   * Returns transaction details including amount and status
   */
  async verifyTransaction(reference: string) {
    const response = await fetch(
      `${this.baseUrl}/transaction/verify/${encodeURIComponent(reference)}`,
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      },
    );

    if (!response.ok) {
      this.logger.error(`Paystack verify failed for ${reference}`);
      return null;
    }

    const data = await response.json();
    return data.data;
  }

  /**
   * Verify Paystack webhook signature
   * Uses HMAC-SHA512 as per Paystack docs
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('PAYSTACK_WEBHOOK_SECRET not configured');
      return false;
    }

    const hash = crypto
      .createHmac('sha512', this.webhookSecret)
      .update(payload)
      .digest('hex');

    return hash === signature;
  }
}
