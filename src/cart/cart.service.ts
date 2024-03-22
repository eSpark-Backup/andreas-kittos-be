/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from 'src/entity/cart.entity';
import { CartDto } from './dto/cart.dto';
import { Users } from 'src/entity';
import { CartItem } from 'src/entity/cart_item.entity';
import { CONSTANT_RESPONSE } from 'src/utils/constant/return.constant';
import { UpdateCartDTO } from './dto/update-cart.dto';
import { CartTransformerService } from './transform-cart-dto.decorator';
import { simpleCartDto } from './dto/simpleCartDto';
import { SimpleUpdateDto } from './dto/simpleUpdateDto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    private readonly cartTransformerService: CartTransformerService,

    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) { }

  async createCart(userId: Users, simpleCart: simpleCartDto[]) {
    const simpleCartArray = Array.isArray(simpleCart)
      ? simpleCart
      : [simpleCart];
    const cartDto: CartDto =
      this.cartTransformerService.transformToCartDto(simpleCartArray);

    const existingCart = await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('cart.userId = :userId', { userId })
      .getOne();


    if (existingCart) {
      for (const itemDto of cartDto.items) {
       
        
        let existingItem;
        for (const cartItem of existingCart.items) {
            if (String(cartItem.product.id) === String(itemDto.product)) {
                existingItem = cartItem;
                break;
            }
        }
        

        if (existingItem) {
          existingItem.quantity += itemDto.quantity;
        } else {
          const newItem = new CartItem();
          newItem.quantity = itemDto.quantity;
          newItem.product = itemDto.product;
          newItem.cart = existingCart.id; // Assign the existing cart to the new item
          existingCart.items.push(newItem); // Add the new item to the existing cart's items
        }
      }

      // Save the updated cart with its items
      await this.cartRepository.save(existingCart);

      // Fetch the updated cart with its items and product details
      const updatedCart = await this.cartRepository
        .createQueryBuilder('cart')
        .leftJoinAndSelect('cart.items', 'items')
        .leftJoinAndSelect('items.product', 'product')
        .where('cart.id = :id', { id: existingCart.id })
        .getOne();

      console.log('Updated Cart:', updatedCart);

      return {
        data: updatedCart,
        message: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY,
      };
    }


    else {
      const newCart = new Cart();
      newCart.user = userId;

      newCart.items = cartDto.items.map((itemDto) => {
        const newItem = new CartItem();
        newItem.quantity = itemDto.quantity;
        newItem.product = itemDto.product;
        return newItem;
      });

      const createdCart = await this.cartRepository.save(newCart);
      return {
        data: createdCart,
        message: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
      };
    }
  }

  async getCart(userId: string) {
    const cart = await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('cart.userId = :userId', { userId })
      .getOne();

    return { data: cart, message: CONSTANT_RESPONSE.GET_ALL };
  }
  async updateCart(
    id: string,
    simpleUpdateDto: SimpleUpdateDto | SimpleUpdateDto[],
  ) {
    const updateCartDto: UpdateCartDTO =
      this.cartTransformerService.transformToUpdateCartDto(simpleUpdateDto);
    const updatedCart = await this.cartRepository
      .createQueryBuilder('cart')
      .where('cart.id = :id', { id: id })
      .getOne();

    if (!updatedCart) {
      return { data: null, message: 'Cart not found' };
    }

    for (const itemDto of updateCartDto.items) {
      await this.cartItemRepository
        .createQueryBuilder()
        .update(CartItem)
        .set({ quantity: itemDto.quantity })
        .where('cartId = :cartId AND productId = :productId', {
          cartId: id,
          productId: itemDto.product,
        })
        .execute();
    }
    const getUpdateCart = await this.cartRepository
      .createQueryBuilder('cart')
      .leftJoinAndSelect('cart.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .where('cart.id = :id', { id: id })
      .getOne();

    return {
      data: getUpdateCart,
      message: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY,
    };
  }

  async deleteItem(id: string) {
    const deleteResult = await this.cartItemRepository.delete(id);
    if (deleteResult.affected === 1) {
      return { data: null, message: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY };
    }
    return { data: null, message: CONSTANT_RESPONSE.DELETE_FAILED };
  }

  async clearCart(id: string) {
    const deleteResult = await this.cartItemRepository.delete({ cart: id });
    if (deleteResult.affected) {
      return { data: null, message: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY };
    }
    return { data: null, message: CONSTANT_RESPONSE.DELETE_FAILED };
  }
}
