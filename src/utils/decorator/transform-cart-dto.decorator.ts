/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CartItemDto } from 'src/cart/dto/cart-item.dto';
import { CartDto } from 'src/cart/dto/cart.dto';
import { simpleCartDto } from 'src/cart/dto/simpleCartDto';
import { SimpleUpdateDto } from 'src/cart/dto/simpleUpdateDto';
import { UpdateCartDTO } from 'src/cart/dto/update-cart.dto';

@Injectable()
export class CartTransformerService {
  transformToCartDto(simpleCart: simpleCartDto[]): CartDto {
    const items: CartItemDto[] = simpleCart.map(item => ({
      quantity: item.quantity,
      product: item.product,
    }));

    return { items };
  }

   transformToUpdateCartDto(simpleUpdateDto: SimpleUpdateDto | SimpleUpdateDto[]): UpdateCartDTO {
    let items: any[];
    if (Array.isArray(simpleUpdateDto)) {
        // If simpleUpdateDto is an array, map each item to transform it
        items = simpleUpdateDto.map(item => ({
            quantity: item.quantity,
            product: item.product
        }));
    } else {
        // If simpleUpdateDto is a single object, wrap it in an array and transform it
        items = [{ quantity: simpleUpdateDto.quantity, product: simpleUpdateDto.product }];
    }
    
    return { items };
}
}
