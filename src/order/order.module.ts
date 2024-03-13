import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Checkout, Users } from 'src/entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entity/order.entity';
import { OrderItem } from 'src/entity/orderItem.entity';
import { OrderDetail } from 'src/entity/orderDetail.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([Checkout, Order, OrderItem, OrderDetail, Users]),
  ],

  controllers: [OrderController],
  providers: [OrderService, JwtService],
})
export class OrderModule {}
