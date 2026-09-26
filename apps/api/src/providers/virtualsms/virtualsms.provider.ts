import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  SmsProvider,
  ProviderConfig,
} from '../interfaces/sms-provider.interface';

/**
 * VirtualSMS Provider
 * Real carrier-grade SIM numbers for Nigerian SMS verification
 * API: https://virtualsms.com/api
 */
@Injectable()
export class VirtualSmsProvider implements SmsProvider {
  readonly name = 'virtualsms';
  private readonly logger = new Logger(VirtualSmsProvider.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(private readonly configService: ConfigService) {
    this.apiKey = this.configService.get<string>('VIRTUALSMS_API_KEY') || '';
    this.baseUrl =
      this.configService.get<string>('VIRTUALSMS_BASE_URL') ||
      'https://api.virtualsms.com';
  }

  async getPrice(service: string, country: string): Promise<number | null> {
    try {
      const response = await fetch(
        `${this.baseUrl}/services?country=${country}&service=${service}`,
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
        },
      );

      if (!response.ok) {
        this.logger.warn(
          `VirtualSMS getPrice failed: ${response.status} for ${service}/${country}`,
        );
        return null;
      }

      const data = await response.json();
      // VirtualSMS returns price in USD
      return data.price || null;
    } catch (error) {
      this.logger.error(
        `VirtualSMS getPrice error: ${error instanceof Error ? error.message : 'Unknown'}`,
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
    const response = await fetch(`${this.baseUrl}/order`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        service,
        country,
        // Request real SIM only, no VoIP
        numberType: 'real',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(
        `VirtualSMS buyNumber failed: ${response.status} - ${errorText}`,
      );
      throw new Error(`VirtualSMS buyNumber failed: ${response.status}`);
    }

    const data = await response.json();

    // VirtualSMS returns orderId, number, and expiry timestamp
    return {
      orderId: data.id.toString(),
      phoneNumber: data.number,
      expiresAt: new Date(data.expiresAt),
    };
  }

  async checkSms(
    providerOrderId: string,
  ): Promise<{
    status: 'waiting' | 'received' | 'expired';
    code?: string;
    text?: string;
  }> {
    const response = await fetch(
      `${this.baseUrl}/order/${providerOrderId}/check`,
      {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      },
    );

    if (!response.ok) {
      this.logger.warn(
        `VirtualSMS checkSms failed for order ${providerOrderId}`,
      );
      return { status: 'waiting' };
    }

    const data = await response.json();

    // VirtualSMS status: 1 = waiting, 2 = received, 3 = expired
    if (data.status === 2) {
      return {
        status: 'received',
        code: data.code,
        text: data.text,
      };
    } else if (data.status === 3) {
      return { status: 'expired' };
    }

    return { status: 'waiting' };
  }

  async cancelOrder(providerOrderId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${this.baseUrl}/order/${providerOrderId}/cancel`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${this.apiKey}` },
        },
      );

      if (!response.ok) {
        this.logger.warn(
          `VirtualSMS cancelOrder failed for ${providerOrderId}`,
        );
        return false;
      }

      const data = await response.json();
      return data.success === true;
    } catch (error) {
      this.logger.error(
        `VirtualSMS cancelOrder error: ${error instanceof Error ? error.message : 'Unknown'}`,
      );
      return false;
    }
  }

  async getBalance(): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/balance`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });

      if (!response.ok) {
        return 0;
      }

      const data = await response.json();
      return data.balance || 0;
    } catch (error) {
      this.logger.error('VirtualSMS getBalance error');
      return 0;
    }
  }
}
