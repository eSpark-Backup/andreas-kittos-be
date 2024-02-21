/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { TypeOrmModule } from '@nestjs/typeorm/dist/typeorm.module';
import { Cart } from 'src/entity/cart.entity';
import { JwtService } from '@nestjs/jwt';
import { CartItem } from 'src/entity/cart_item.entity';
import { CartTransformerService } from 'src/cart/transform-cart-dto.decorator';

@Module({
    imports: [TypeOrmModule.forFeature([Cart,CartItem])],
    controllers: [CartController],
    providers: [CartService,JwtService,CartTransformerService],
})
export class CartModule {}
