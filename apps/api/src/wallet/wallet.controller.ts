import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { PaymentsService } from '../payments/payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { MIN_TOPUP_CENTS, MAX_TOPUP_CENTS, convertToUsdCents, EXCHANGE_RATES } from '../common/constants';

class DepositDto {
  @IsNumber()
  @Min(MIN_TOPUP_CENTS)
  @Max(MAX_TOPUP_CENTS)
  amountCents!: number;

  @IsOptional()
  @IsString()
  currency?: string; // NGN, GHS, USD
}

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Get('balance')
  async getBalance(@Request() req: any) {
    return this.walletService.getBalance(req.user.userId);
  }

  @Get('transactions')
  async getTransactions(
    @Request() req: any,
    @Query('limit') limit?: number,
  ) {
    return this.walletService.getTransactions(req.user.userId, limit);
  }

  @Get('exchange-rates')
  async getExchangeRates() {
    return {
      rates: EXCHANGE_RATES,
      supportedCurrencies: ['NGN', 'GHS', 'USD'],
    };
  }

  @Post('deposit')
  async deposit(@Request() req: any, @Body() dto: DepositDto) {
    const userId = req.user.userId;
    const email = req.user.email;

    // If currency is provided (local currency), convert to USD cents
    let amountCents = dto.amountCents;
    let originalAmount: number | undefined;
    let originalCurrency: string | undefined;
    let exchangeRate: number | undefined;

    if (dto.currency && dto.currency !== 'USD') {
      originalAmount = dto.amountCents;
      originalCurrency = dto.currency;
      exchangeRate = EXCHANGE_RATES[dto.currency];
      
      if (!exchangeRate) {
        throw new Error(`Unsupported currency: ${dto.currency}`);
      }

      // Convert local currency to USD cents
      amountCents = convertToUsdCents(dto.amountCents, dto.currency);
    }

    // Initialize Paystack transaction
    // Paystack expects amount in local currency smallest unit
    const paystackAmount = dto.currency && dto.currency !== 'USD' 
      ? dto.amountCents // Already in kobo/pesewas
      : dto.amountCents; // USD cents, Paystack will handle

    const response = await this.paymentsService.initializeTransaction(
      email,
      paystackAmount,
      dto.currency || 'USD',
    );

    return {
      authorization_url: response.authorization_url,
      access_code: response.access_code,
      reference: response.reference,
      amountCents, // USD cents that will be credited
      originalAmount,
      originalCurrency,
      exchangeRate,
    };
  }
}
