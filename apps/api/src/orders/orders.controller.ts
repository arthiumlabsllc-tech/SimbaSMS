import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IsString } from 'class-validator';

class BuyNumberDto {
  @IsString()
  service!: string;

  @IsString()
  country!: string;
}

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get('services')
  async getServices() {
    // Return supported services and countries
    return {
      services: [
        'gmail',
        'openai',
        'whatsapp',
        'tinder',
        'telegram',
        'facebook',
        'twitter',
        'instagram',
        'tiktok',
        'uber',
      ],
      countries: ['US', 'UK', 'NG', 'GH', 'KE', 'ZA', 'CA', 'DE', 'FR', 'IN'],
    };
  }

  @Get('services/:service/price')
  async getPrice(
    @Param('service') service: string,
    @Query('country') country: string,
  ) {
    return this.ordersService.getPrice(service, country);
  }

  @Post()
  async buyNumber(@Request() req: any, @Body() dto: BuyNumberDto) {
    return this.ordersService.buyNumber(
      req.user.userId,
      dto.service,
      dto.country,
    );
  }

  @Get()
  async getOrders(@Request() req: any, @Query('limit') limit?: number) {
    return this.ordersService.getUserOrders(req.user.userId, limit);
  }

  @Get(':id')
  async getOrder(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.getOrder(req.user.userId, id);
  }

  @Post(':id/cancel')
  async cancelOrder(@Request() req: any, @Param('id') id: string) {
    return this.ordersService.cancelOrder(req.user.userId, id);
  }
}
