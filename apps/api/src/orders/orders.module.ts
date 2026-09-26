import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { ProvidersModule } from '../providers/providers.module';
import { WalletModule } from '../wallet/wallet.module';
import { WebsocketModule } from '../websocket/websocket.module';

@Module({
  imports: [ProvidersModule, WalletModule, forwardRef(() => WebsocketModule)],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
