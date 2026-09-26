import {
  Controller,
  Post,
  Headers,
  Body,
  Logger,
} from '@nestjs/common';
import { PaymentsService } from '../payments/payments.service';
import { WalletService } from '../wallet/wallet.service';
import { PrismaService } from '../common/prisma.service';
import { convertToUsdCents, EXCHANGE_RATES } from '../common/constants';

@Controller('payments')
export class WebhooksController {
  private readonly logger = new Logger(WebhooksController.name);

  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly walletService: WalletService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('webhook')
  async handleWebhook(
    @Headers('x-paystack-signature') signature: string,
    @Body() body: any,
  ) {
    // Verify webhook signature
    const payload = JSON.stringify(body);
    const isValid = this.paymentsService.verifyWebhookSignature(
      payload,
      signature,
    );

    if (!isValid) {
      this.logger.warn('Invalid webhook signature');
      return { status: 'invalid signature' };
    }

    const event = body.event;
    const data = body.data;

    this.logger.log(`Received Paystack webhook: ${event}`);

    // Handle charge.success event
    if (event === 'charge.success') {
      await this.handleChargeSuccess(data);
    }

    return { status: 'received' };
  }

  private async handleChargeSuccess(data: any) {
    const reference = data.reference;
    const amount = data.amount; // Amount in local currency smallest unit
    const currency = data.currency; // NGN, GHS, etc.
    const status = data.status;
    const metadata = data.metadata;

    // Extract user ID from metadata (set during transaction initialization)
    const userId = metadata?.userId;
    if (!userId) {
      this.logger.error(`No userId in webhook metadata for ${reference}`);
      return;
    }

    // Check if already processed (idempotency check)
    const existing = await this.prisma.transaction.findUnique({
      where: { paystackRef: reference },
    });

    if (existing) {
      this.logger.log(`Webhook already processed for ${reference}`);
      return;
    }

    // Convert local currency to USD cents
    let amountCents: number;
    let originalAmount: number | undefined;
    let originalCurrency: string | undefined;
    let exchangeRate: number | undefined;

    if (currency && currency !== 'USD' && EXCHANGE_RATES[currency]) {
      originalAmount = amount;
      originalCurrency = currency;
      exchangeRate = EXCHANGE_RATES[currency];
      amountCents = convertToUsdCents(amount, currency);
    } else {
      // Already in USD cents
      amountCents = amount;
    }

    // Credit wallet (idempotent - checks paystackRef internally)
    await this.walletService.creditWallet(
      userId,
      amountCents,
      reference,
      status,
      originalAmount,
      originalCurrency,
      exchangeRate,
    );

    this.logger.log(
      `Webhook: Credited $${(amountCents / 100).toFixed(2)} to user ${userId} for ref ${reference}` +
      (originalAmount ? ` (original: ${originalAmount / 100} ${originalCurrency})` : ''),
    );
  }
}
