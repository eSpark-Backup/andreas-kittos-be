import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Checkout, Users, Cart, Address } from 'src/entity';
import { Repository } from 'typeorm';
import { CheckoutDto } from './dto/create-checkout.dto';
import { CONSTANT_RESPONSE } from 'src/utils/constant/return.constant';

@Injectable()
export class CheckoutService {
  constructor(
    @InjectRepository(Checkout)
    private readonly checkoutRepository: Repository<Checkout>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(userId: string, checkoutDto: CheckoutDto) {
    const {
      total,
      subTotal,
      shippingType,
      cartId,
      deliveryCharges,
      shippingAddressId,
      deliveryDate,
      note,
    } = checkoutDto;

    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new Error('User not found');
    }

    let checkout = await this.checkoutRepository
      .createQueryBuilder('checkout')
      .leftJoinAndSelect('checkout.cart', 'cart')
      .where('checkout.user = :userId', { userId })
      .andWhere('cart.id = :cartId', { cartId })
      .getOne();

    if (!checkout) {
      checkout = new Checkout();
    }


    if (!shippingAddressId) {
      const address = await this.addressRepository
        .createQueryBuilder('address')
        .leftJoinAndSelect('address.user', 'user')
        .where('address.user = :userId', { userId })
        .andWhere('address.isDefault = true')
        .andWhere('address.type = :type', { type: 'shipping' })
        .getOne();

      checkout.shippingAddress = address;
    }

    checkout.total = total;
    checkout.shippingType = shippingType;
    checkout.subTotal = subTotal;
    checkout.user = user;
    checkout.note = note;
    checkout.deliveryCharges = deliveryCharges;
    checkout.deliveryDate = deliveryDate;

    const cart = await this.cartRepository.findOne({
      where: { id: cartId },
      relations: ['items'],
    });
    if (!cart) {
      throw new Error('Cart not found');
    }
    checkout.cart = cart;

    if (shippingAddressId) {
      const shippingAddress = await this.addressRepository
        .createQueryBuilder('address')
        .where('address.id = :shippingAddressId', { shippingAddressId })
        .getOne();

      if (!shippingAddress) {
        throw new Error('Shipping address not found');
      }
      checkout.shippingAddress = shippingAddress;
    }

    await this.checkoutRepository.save(checkout);
    const data = await this.findAll(userId);
    return {
      data,
      message: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    };
  }

  async findAll(userId: string) {
    const checkouts = await this.checkoutRepository
      .createQueryBuilder('checkout')
      .leftJoinAndSelect('checkout.cart', 'cart')
      .leftJoinAndSelect('cart.items', 'items')
      .leftJoinAndSelect('checkout.shippingAddress', 'shippingAddress')
      .where('checkout.user = :userId', { userId })
      .getMany();

    return checkouts;
  }
}
