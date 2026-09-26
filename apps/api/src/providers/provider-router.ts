import { Injectable, Logger } from '@nestjs/common';
import { SmsProvider } from './interfaces/sms-provider.interface';
import { VirtualSmsProvider } from './virtualsms/virtualsms.provider';
import { FiveSimProvider } from './fivesim/fivesim.provider';
import { PROVIDER_FAILURE_THRESHOLD } from '../common/constants';

/**
 * Provider Router
 * Routes requests to the best provider based on:
 * 1. Availability (price > 0)
 * 2. Priority (service+country -> provider order)
 * 3. Failure tracking (auto-switch after N consecutive failures)
 */
@Injectable()
export class ProviderRouter {
  private readonly logger = new Logger(ProviderRouter.name);

  // Provider priority map: (service, country) -> [provider names in priority order]
  private readonly priorityMap = new Map<string, string[]>();

  // Failure counters: (service, country, providerName) -> consecutive failure count
  private readonly failureCounters = new Map<string, number>();

  private readonly providers: Map<string, SmsProvider>;

  constructor(
    private readonly virtualSms: VirtualSmsProvider,
    private readonly fiveSim: FiveSimProvider,
  ) {
    const providerList: [string, SmsProvider][] = [
      ['virtualsms', virtualSms as SmsProvider],
      ['fivesim', fiveSim as SmsProvider],
    ];
    this.providers = new Map(providerList);

    // Default priority: virtualsms first, then fivesim
    // Can be overridden per (service, country) pair
    this.initializeDefaultPriorities();
  }

  private initializeDefaultPriorities() {
    // Default: prefer VirtualSMS for Nigeria, 5sim for others
    const defaultPriority = ['virtualsms', 'fivesim'];

    // Pre-configure some known priorities
    this.priorityMap.set('openai:US', ['fivesim', 'virtualsms']);
    this.priorityMap.set('openai:UK', ['fivesim', 'virtualsms']);
    this.priorityMap.set('gmail:NG', ['virtualsms', 'fivesim']);
    this.priorityMap.set('whatsapp:NG', ['virtualsms', 'fivesim']);
  }

  /**
   * Get the best provider for a service+country pair
   * Skips providers that have exceeded failure threshold
   */
  async getProvider(
    service: string,
    country: string,
  ): Promise<SmsProvider | null> {
    const key = `${service}:${country}`;
    const priority = this.priorityMap.get(key) || ['virtualsms', 'fivesim'];

    for (const providerName of priority) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      const failureKey = `${key}:${providerName}`;
      const failures = this.failureCounters.get(failureKey) || 0;

      if (failures >= PROVIDER_FAILURE_THRESHOLD) {
        this.logger.warn(
          `Provider ${providerName} has ${failures} consecutive failures for ${key}, skipping`,
        );
        continue;
      }

      // Check if provider has this service available
      const price = await provider.getPrice(service, country);
      if (price !== null && price > 0) {
        return provider;
      }
    }

    this.logger.error(`No available provider for ${key}`);
    return null;
  }

  /**
   * Record a successful operation for a provider
   * Resets failure counter
   */
  recordSuccess(service: string, country: string, providerName: string) {
    const key = `${service}:${country}:${providerName}`;
    this.failureCounters.delete(key);
  }

  /**
   * Record a failed operation for a provider
   * Increments failure counter
   */
  recordFailure(service: string, country: string, providerName: string) {
    const key = `${service}:${country}:${providerName}`;
    const current = this.failureCounters.get(key) || 0;
    this.failureCounters.set(key, current + 1);

    this.logger.warn(
      `Provider ${providerName} failure #${current + 1} for ${service}:${country}`,
    );
  }

  /**
   * Get all providers (for admin/health checks)
   */
  getAllProviders(): SmsProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get a specific provider by name
   */
  getProviderByName(name: string): SmsProvider | undefined {
    return this.providers.get(name);
  }
}
