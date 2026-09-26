import { Injectable, Logger, Inject, forwardRef } from '@nestjs/common';
import { Queue, Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { OrdersService } from '../orders/orders.service';
import { ProviderRouter } from '../providers/provider-router';
import { PrismaService } from '../common/prisma.service';
import { SMS_POLL_INTERVAL_MS } from '@simbasms/shared';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);
  private readonly pollingQueue: Queue;
  private readonly worker: Worker;
  private readonly redisConnection: Redis;

  constructor(
    private readonly configService: ConfigService,
    @Inject(forwardRef(() => OrdersService))
    private readonly ordersService: OrdersService,
    private readonly providerRouter: ProviderRouter,
    private readonly prisma: PrismaService,
  ) {
    this.redisConnection = new Redis(
      this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379',
      { maxRetriesPerRequest: null },
    );

    this.pollingQueue = new Queue('sms-polling', {
      connection: this.redisConnection,
    });

    this.worker = new Worker(
      'sms-polling',
      async (job) => {
        await this.processPollingJob(job.data.orderId);
      },
      {
        connection: this.redisConnection,
        concurrency: 10,
      },
    );

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Polling job failed: ${err.message}`);
    });
  }

  /**
   * Add order to polling queue
   */
  async addToPollingQueue(orderId: string) {
    await this.pollingQueue.add('poll-sms', { orderId }, {
      repeat: {
        every: SMS_POLL_INTERVAL_MS,
      },
      removeOnComplete: 100,
      removeOnFail: 50,
    });

    this.logger.log(`Added order ${orderId} to polling queue`);
  }

  /**
   * Remove order from polling queue
   */
  async removeFromPollingQueue(orderId: string) {
    const jobs = await this.pollingQueue.getRepeatableJobs();
    for (const job of jobs) {
      if ((job as any).data?.orderId === orderId) {
        await this.pollingQueue.removeRepeatableByKey(job.key);
      }
    }
  }

  /**
   * Process a polling job: check SMS from provider
   */
  private async processPollingJob(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.status !== 'WAITING') {
      await this.removeFromPollingQueue(orderId);
      return;
    }

    // Check if order expired
    if (new Date() > order.expiresAt) {
      await this.ordersService.handleOrderExpired(orderId);
      await this.removeFromPollingQueue(orderId);
      return;
    }

    // Get provider
    const provider = this.providerRouter.getProviderByName(order.providerName);
    if (!provider) {
      this.logger.error(`Provider ${order.providerName} not found`);
      return;
    }

    // Check SMS
    const result = await provider.checkSms(order.providerOrderId);

    if (result.status === 'received' && result.code) {
      await this.ordersService.handleSmsReceived(
        orderId,
        result.code,
        result.text || '',
      );
      await this.removeFromPollingQueue(orderId);
      this.logger.log(`Order ${orderId}: SMS received and processed`);
    } else if (result.status === 'expired') {
      await this.ordersService.handleOrderExpired(orderId);
      await this.removeFromPollingQueue(orderId);
      this.logger.log(`Order ${orderId}: Provider confirmed expired`);
    }
  }
}
