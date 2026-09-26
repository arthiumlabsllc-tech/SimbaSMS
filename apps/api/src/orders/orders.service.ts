import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { ProviderRouter } from '../providers/provider-router';
import { WalletService } from '../wallet/wallet.service';
import { QueueService } from '../websocket/queue.service';
import {
  DEFAULT_MARKUP_PERCENT,
  ORDER_EXPIRY_MS,
} from '../common/constants';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly providerRouter: ProviderRouter,
    private readonly walletService: WalletService,
    @Inject(forwardRef(() => QueueService))
    private readonly queueService: QueueService,
  ) {}

  /**
   * Get price for a service+country
   * Calculated from live provider cost + markup
   * All prices in USD cents
   */
  async getPrice(service: string, country: string) {
    const provider = await this.providerRouter.getProvider(service, country);
    if (!provider) {
      return { available: false, priceCents: 0 };
    }

    const providerCostUsd = await provider.getPrice(service, country);
    if (providerCostUsd === null) {
      return { available: false, priceCents: 0 };
    }

    // Convert USD to cents
    const providerCostCents = Math.ceil(providerCostUsd * 100);

    // Apply markup
    const priceCents = Math.ceil(
      providerCostCents * (1 + DEFAULT_MARKUP_PERCENT / 100),
    );

    return {
      available: true,
      priceCents,
      providerCostUsd,
      providerName: provider.name,
    };
  }

  /**
   * Buy a number for a service+country
   * Creates order, debits wallet, starts polling
   */
  async buyNumber(
    userId: string,
    service: string,
    country: string,
  ) {
    // Get provider and price
    const priceInfo = await this.getPrice(service, country);
    if (!priceInfo.available) {
      throw new BadRequestException(
        `Service ${service} not available for country ${country}`,
      );
    }

    const { priceCents, providerCostUsd, providerName } = priceInfo;

    // Check user balance
    const balance = await this.walletService.getBalance(userId);
    if (balance.balanceCents < priceCents) {
      throw new BadRequestException('Insufficient balance');
    }

    // Get provider
    const provider = await this.providerRouter.getProvider(service, country);
    if (!provider) {
      throw new BadRequestException('No provider available');
    }

    // Buy number from provider
    let providerOrder;
    try {
      providerOrder = await provider.buyNumber(service, country);
      this.providerRouter.recordSuccess(service, country, provider.name);
    } catch (error) {
      this.providerRouter.recordFailure(service, country, provider.name);
      this.logger.error(`Provider ${provider.name} buyNumber failed: ${error}`);
      throw new BadRequestException('Failed to purchase number');
    }

    // Create order in database
    const order = await this.prisma.order.create({
      data: {
        userId,
        service,
        country,
        providerName: provider.name,
        providerOrderId: providerOrder.orderId,
        phoneNumber: providerOrder.phoneNumber,
        costCents: priceCents,
        providerCostUsd: providerCostUsd || 0,
        status: 'PURCHASED',
        expiresAt: new Date(Date.now() + ORDER_EXPIRY_MS),
      },
    });

    // Debit user wallet
    const debited = await this.walletService.debitWallet(
      userId,
      priceCents,
      order.id,
    );

    if (!debited) {
      // Rollback: cancel provider order
      await provider.cancelOrder(providerOrder.orderId);
      await this.prisma.order.delete({ where: { id: order.id } });
      throw new BadRequestException('Insufficient balance');
    }

    // Update order status to WAITING
    await this.prisma.order.update({
      where: { id: order.id },
      data: { status: 'WAITING' },
    });

    // Add to polling queue
    await this.queueService.addToPollingQueue(order.id);

    this.logger.log(
      `Order ${order.id} created for user ${userId}: ${service}/${country} via ${provider.name}`,
    );

    return order;
  }

  /**
   * Get user's orders
   */
  async getUserOrders(userId: string, limit = 50) {
    return this.prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit) || 50,
    });
  }

  /**
   * Get order details
   */
  async getOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return order;
  }

  /**
   * Cancel an order (only in WAITING state)
   */
  async cancelOrder(userId: string, orderId: string) {
    const order = await this.getOrder(userId, orderId);

    if (order.status !== 'WAITING') {
      throw new BadRequestException('Can only cancel orders in WAITING state');
    }

    // Get provider
    const provider = this.providerRouter.getProviderByName(order.providerName);
    if (!provider) {
      throw new BadRequestException('Provider not found');
    }

    // Cancel with provider
    const cancelled = await provider.cancelOrder(order.providerOrderId);

    if (cancelled) {
      // Update order status
      await this.prisma.order.update({
        where: { id: orderId },
        data: { status: 'REFUNDED' },
      });

      // Refund user wallet
      await this.walletService.refundWallet(
        userId,
        order.costCents,
        orderId,
      );

      this.logger.log(`Order ${orderId} cancelled and refunded`);
    } else {
      this.logger.warn(`Provider refused to cancel order ${orderId}`);
      throw new BadRequestException('Provider refused cancellation');
    }

    return { success: true };
  }

  /**
   * Handle SMS received (called by queue processor)
   */
  async handleSmsReceived(
    orderId: string,
    code: string,
    text: string,
  ) {
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'RECEIVED',
        smsCode: code,
        smsText: text,
      },
    });

    this.logger.log(`Order ${orderId}: SMS received`);
  }

  /**
   * Handle order expired (called by queue processor)
   */
  async handleOrderExpired(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.status !== 'WAITING') {
      return;
    }

    // Update order status
    await this.prisma.order.update({
      where: { id: orderId },
      data: { status: 'EXPIRED' },
    });

    // Refund user wallet
    await this.walletService.refundWallet(
      order.userId,
      order.costCents,
      orderId,
    );

    this.logger.log(`Order ${orderId} expired and refunded`);
  }
}
