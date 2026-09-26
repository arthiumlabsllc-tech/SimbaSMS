import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CryptoPaymentsService } from './crypto-payments.service';
import { CryptoPaymentsController } from './crypto-payments.controller';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [ConfigModule, WalletModule],
  controllers: [CryptoPaymentsController],
  providers: [CryptoPaymentsService],
  exports: [CryptoPaymentsService],
})
export class CryptoPaymentsModule {}
