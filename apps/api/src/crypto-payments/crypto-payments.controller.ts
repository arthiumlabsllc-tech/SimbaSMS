import {
  Controller,
  Get,
  Post,
  Body,
  Headers,
  UseGuards,
  Request,
  Logger,
  Param,
} from '@nestjs/common';
import { CryptoPaymentsService } from './crypto-payments.service';
import { WalletService } from '../wallet/wallet.service';
import { PrismaService } from '../common/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsEnum, IsNumber, Min, Max } from 'class-validator';
import { MIN_TOPUP_CENTS, MAX_TOPUP_CENTS } from '@simbasms/shared';

enum CryptoCurrency {
  BTC = 'BTC',
  USDT_TRC20 = 'USDT_TRC20',
  USDT_ERC20 = 'USDT_ERC20',
}

class CryptoDepositDto {
  @IsNumber()
  @Min(MIN_TOPUP_CENTS)
  @Max(MAX_TOPUP_CENTS)
  amountCents!: number;

  @IsEnum(CryptoCurrency)
  currency!: CryptoCurrency;
}

@Controller('crypto')
export class CryptoPaymentsController {
  private readonly logger = new Logger(CryptoPaymentsController.name);

  constructor(
    private readonly cryptoService: CryptoPaymentsService,
    private readonly walletService: WalletService,
    private readonly prisma: PrismaService,
  ) {}

  @Get('currencies')
  async getSupportedCurrencies() {
    const currencies = this.cryptoService.getSupportedCurrencies();
    const rates = await this.cryptoService.getCryptoRates();
    
    return {
      currencies: currencies.map((c) => ({
        ...c,
        ...rates[c.code as keyof typeof rates],
      })),
    };
  }

  @Post('deposit')
  @UseGuards(JwtAuthGuard)
  async createDeposit(@Request() req: any, @Body() dto: CryptoDepositDto) {
    const userId = req.user.userId;

    const payment = await this.cryptoService.createPayment({
      userId,
      amountCents: dto.amountCents,
      currency: dto.currency,
    });

    // Store pending payment in database
    await this.prisma.transaction.create({
      data: {
        userId,
        type: 'DEPOSIT',
        amountCents: dto.amountCents,
        balanceAfter: 0, // Will be updated when payment completes
        paystackRef: payment.paymentId, // Using paystackRef field for crypto payment ID
        paystackStatus: 'pending',
        originalAmount: dto.amountCents,
        originalCurrency: dto.currency,
      },
    });

    return payment;
  }

  @Get('status/:paymentId')
  @UseGuards(JwtAuthGuard)
  async getPaymentStatus(@Request() req: any, @Param('paymentId') paymentId: string) {
    return this.cryptoService.checkPaymentStatus(paymentId);
  }

  @Post('webhook')
  async handleWebhook(
    @Headers('x-nowpayments-sig') signature: string,
    @Body() body: any,
  ) {
    // Verify webhook signature
    const payload = JSON.stringify(body);
    const isValid = this.cryptoService.verifyWebhookSignature(payload, signature);

    if (!isValid) {
      this.logger.warn('Invalid crypto webhook signature');
      return { status: 'invalid signature' };
    }

    const { payment_id, payment_status, pay_amount, pay_currency, actually_paid, order_id } = body;

    this.logger.log(`Received crypto webhook: ${payment_status} for ${payment_id}`);

    if (payment_status === 'finished') {
      // Find the pending transaction
      const transaction = await this.prisma.transaction.findUnique({
        where: { paystackRef: payment_id },
      });

      if (transaction && transaction.paystackStatus === 'pending') {
        // Calculate USD cents from crypto amount
        const usdCents = Math.round(actually_paid * 100); // Assuming USDT = 1:1

        // Credit user wallet
        await this.walletService.creditWallet(
          transaction.userId,
          usdCents,
          payment_id,
          'success',
          Math.round(pay_amount * 100),
          pay_currency,
          1, // Exchange rate (1:1 for USDT)
        );

        this.logger.log(
          `Crypto payment ${payment_id} completed: $${(usdCents / 100).toFixed(2)} credited to user ${transaction.userId}`,
        );
      }
    }

    return { status: 'received' };
  }
}
