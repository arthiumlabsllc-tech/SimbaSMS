import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class WebsocketGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(WebsocketGateway.name);

  // Map of userId -> socketId
  private readonly userSockets = new Map<string, string>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract JWT from handshake
      const token = client.handshake.auth?.token;
      if (!token) {
        this.logger.warn(`Socket ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Verify token
      const payload = this.jwtService.verify(token);
      const userId = payload.sub;

      // Store socket mapping
      this.userSockets.set(userId, client.id);
      client.data.userId = userId;

      this.logger.log(`Socket ${client.id} connected for user ${userId}`);
    } catch (error) {
      this.logger.warn(`Socket ${client.id} auth failed: ${error}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.userSockets.delete(userId);
      this.logger.log(`Socket ${client.id} disconnected for user ${userId}`);
    }
  }

  /**
   * Send order update to specific user
   */
  sendOrderUpdate(userId: string, order: any) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('order:update', order);
    }
  }

  /**
   * Send SMS received notification to specific user
   */
  sendSmsReceived(userId: string, orderId: string, code: string) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('sms:received', { orderId, code });
    }
  }

  /**
   * Send balance update to specific user
   */
  sendBalanceUpdate(userId: string, balanceKobo: number) {
    const socketId = this.userSockets.get(userId);
    if (socketId) {
      this.server.to(socketId).emit('balance:update', { balanceKobo });
    }
  }
}
