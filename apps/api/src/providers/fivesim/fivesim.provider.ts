import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SmsProvider } from '../interfaces/sms-provider.interface';

/**
 * 5sim Provider
 * Real carrier-grade SIM numbers for global SMS verification
 * API: https://5sim.net/api
 */
@Injectable()
export class FiveSimProvider implements SmsProvider {
  readonly name = 'fivesim';
  private readonly logger = new Logger(FiveSimProvider.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('FIVESIM_API_KEY') || '';
    this.baseUrl =
      this.configService.get<string>('FIVESIM_BASE_URL') ||
      'https://5sim.net/v1';
  }

  async getPrice(service: string, country: string): Promise<number | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/products/hops?country=${country.toLowerCase()}&product=${service}`,
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        },
      );

      if (!response.ok) {
        this.logger.warn(
          `5sim getPrice failed: ${response.status} for ${service}/${country}`,
        );
        return null;
      }

      const data = await response.json();
      // 5sim returns price in USD
      return data.cost || null;
    } catch (error) {
      this.logger.error(
        `5sim getPrice error: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
      return null;
    }
  }

  async buyNumber(
    service: string,
    country: string,
  ): Promise<{
    orderId: string;
    phoneNumber: string;
    expiresAt: Date;
  }> {
    const response = await fetch(`${this.baseUrl}/user/buy/activation`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        country: country.toLowerCase(),
        product: service,
        // 5sim guarantees real SIM numbers
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `5sim buyNumber failed: ${response.status} - ${errorText}`,
      );
      throw new Error(`5sim buyNumber failed: ${response.status}`);
    }

    const data = await response.json();

    // 5sim returns id, phone, and expires timestamp
    return {
      orderId: data.id.toString(),
      phoneNumber: data.phone,
      expiresAt: new Date(data.expires * 1000), // 5sim returns unix timestamp
    };
  }

  async checkSms(
    providerOrderId: string,
  ): Promise<{
    status: 'waiting' | 'received' | 'expired';
    code?: string;
    text?: string;
  }> {
    const response = await fetch(`${this.baseUrl}/user/check/${providerOrderId}`, {
      headers: { Authorization: `Bearer ${this.apiKey}` },
    });

    if (!response.ok) {
      this.logger.warn(`5sim checkSms failed for order ${providerOrderId}`);
      return { status: 'waiting' };
    }

    const data = await response.json();

    // 5sim status: PENDING = waiting, FINISHED = received, CANCELED = expired
    if (data.status === 'FINISHED' && data.sms && data.sms.length > 0) {
      const lastSms = data.sms[data.sms.length - 1];
      return {
        status: 'received',
        code: lastSms.code,
        text: lastSms.text,
      };
    } else if (data.status === 'CANCELED' || data.status === 'TIMEOUT') {
      return { status: 'expired' };
    }

    return { status: 'waiting' };
  }

  async cancelOrder(providerOrderId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/user/cancel/${providerOrderId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.apiKey}` },
        },
      );

      if (!response.ok) {
        this.logger.warn(`5sim cancelOrder failed for ${providerOrderId}`);
        return false;
      }

      const data = await response.json();
      return data.status === 'CANCELED';
    } catch (error) {
      this.logger.error(
        `5sim cancelOrder error: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
      return false;
    }
  }

  async getBalance(): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/user/profile`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });

      if (!response.ok) {
        return 0;
      }

      const data = await response.json();
      return data.balance || 0;
    } catch (error) {
      this.logger.error('5sim getBalance error');
      return 0;
    }
  }
}
