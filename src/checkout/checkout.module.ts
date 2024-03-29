import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckoutService } from './checkout.service';
import { CheckoutController } from './checkout.controller';
import { Checkout, Users, Cart, Address } from 'src/entity';
import { JwtService } from '@nestjs/jwt';
@Module({
  imports: [TypeOrmModule.forFeature([Checkout, Users, Cart, Address])],
  providers: [CheckoutService, JwtService],
  controllers: [CheckoutController],
})
export class CheckoutModule {}
