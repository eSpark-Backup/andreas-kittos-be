/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { CartItem, Checkout, Users } from 'src/entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from 'src/entity/order.entity';
import { JwtService } from '@nestjs/jwt';
import { OrderDetail } from 'src/entity/orderDetail.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Checkout, Order, OrderDetail, Users,CartItem]),
  ],

  controllers: [OrderController],
  providers: [OrderService, JwtService],
})
export class OrderModule {}
