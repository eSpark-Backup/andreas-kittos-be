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
      shippingType,
      cartId,
      billingAddressId,
      shippingAddressId,
      deliveryCharges,
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

    checkout.total = total;
    checkout.shippingType = shippingType;
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

    const billingAddress = await this.addressRepository.findOne({
      where: { id: billingAddressId },
    });
    if (!billingAddress) {
      throw new Error('Billing address not found');
    }
    checkout.billingAddress = billingAddress;

    const shippingAddress = await this.addressRepository.findOne({
      where: { id: shippingAddressId },
    });
    if (!shippingAddress) {
      throw new Error('Shipping address not found');
    }
    checkout.shippingAddress = shippingAddress;

    const savedCheckout = await this.checkoutRepository.save(checkout);

    return {
      data: savedCheckout,
      message: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    };
  }
}
