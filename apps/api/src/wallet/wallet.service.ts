import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getBalance(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { balanceCents: true },
    });
    return { balanceCents: user.balanceCents };
  }

  async getTransactions(userId: string, limit = 50) {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Number(limit) || 50,
    });
  }

  /**
   * Credit user wallet (used after Paystack verification)
   * Idempotent: checks paystackRef to prevent double-credit
   * @param amountCents - Amount in USD cents
   * @param originalAmount - Original amount in local currency (optional)
   * @param originalCurrency - Currency code like NGN, GHS (optional)
   * @param exchangeRate - Exchange rate used (optional)
   */
  async creditWallet(
    userId: string,
    amountCents: number,
    paystackRef: string,
    paystackStatus: string,
    originalAmount?: number,
    originalCurrency?: string,
    exchangeRate?: number,
  ) {
    // Check if already credited (idempotency)
    const existing = await this.prisma.transaction.findUnique({
      where: { paystackRef },
    });
    if (existing) {
      this.logger.warn(
        `Duplicate credit attempt for paystackRef ${paystackRef}`,
      );
      return existing;
    }

    // Use transaction to ensure atomicity
    return this.prisma.$transaction(async (tx) => {
      // Get current balance
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { balanceCents: true },
      });

      const newBalance = user.balanceCents + amountCents;

      // Update user balance
      await tx.user.update({
        where: { id: userId },
        data: { balanceCents: newBalance },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: 'DEPOSIT',
          amountCents,
          balanceAfter: newBalance,
          paystackRef,
          paystackStatus,
          originalAmount,
          originalCurrency,
          exchangeRate,
        },
      });

      this.logger.log(
        `Credited $${(amountCents / 100).toFixed(2)} to user ${userId}. New balance: $${(newBalance / 100).toFixed(2)}`,
      );

      return transaction;
    });
  }

  /**
   * Debit user wallet (used for order charges)
   * Returns false if insufficient balance
   */
  async debitWallet(
    userId: string,
    amountCents: number,
    orderId: string,
  ): Promise<boolean> {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { balanceCents: true },
      });

      if (user.balanceCents < amountCents) {
        return false;
      }

      const newBalance = user.balanceCents - amountCents;

      await tx.user.update({
        where: { id: userId },
        data: { balanceCents: newBalance },
      });

      await tx.transaction.create({
        data: {
          userId,
          type: 'ORDER_CHARGE',
          amountCents: -amountCents,
          balanceAfter: newBalance,
          orderId,
        },
      });

      this.logger.log(
        `Debited $${(amountCents / 100).toFixed(2)} from user ${userId} for order ${orderId}`,
      );

      return true;
    });
  }

  /**
   * Refund user wallet (used when order expires/cancels)
   * Only called AFTER provider confirms refund
   */
  async refundWallet(
    userId: string,
    amountCents: number,
    orderId: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: userId },
        select: { balanceCents: true },
      });

      const newBalance = user.balanceCents + amountCents;

      await tx.user.update({
        where: { id: userId },
        data: { balanceCents: newBalance },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: 'REFUND',
          amountCents,
          balanceAfter: newBalance,
          orderId,
        },
      });

      this.logger.log(
        `Refunded $${(amountCents / 100).toFixed(2)} to user ${userId} for order ${orderId}`,
      );

      return transaction;
    });
  }
}
