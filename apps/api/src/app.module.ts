import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma.module';
import { AuthModule } from './auth/auth.module';
import { WalletModule } from './wallet/wallet.module';
import { PaymentsModule } from './payments/payments.module';
import { OrdersModule } from './orders/orders.module';
import { ProvidersModule } from './providers/providers.module';
import { WebsocketModule } from './websocket/websocket.module';
import { WebhooksModule } from './webhooks/webhooks.module';
import { CryptoPaymentsModule } from './crypto-payments/crypto-payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    WalletModule,
    PaymentsModule,
    OrdersModule,
    ProvidersModule,
    WebsocketModule,
    WebhooksModule,
    CryptoPaymentsModule,
  ],
})
export class AppModule {}
