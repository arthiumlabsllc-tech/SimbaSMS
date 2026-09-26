import { Module, forwardRef } from '@nestjs/common';
import { WebsocketGateway } from './websocket.gateway';
import { QueueService } from './queue.service';
import { AuthModule } from '../auth/auth.module';
import { ProvidersModule } from '../providers/providers.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [AuthModule, ProvidersModule, forwardRef(() => OrdersModule)],
  providers: [WebsocketGateway, QueueService],
  exports: [WebsocketGateway, QueueService],
})
export class WebsocketModule {}
