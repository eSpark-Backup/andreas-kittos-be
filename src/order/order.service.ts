/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem, Checkout, Users } from 'src/entity';
import { Order } from 'src/entity/order.entity';
import { OrderDetail } from 'src/entity/orderDetail.entity';
import { extractAddressData } from 'src/utils/function/extractAddress';
import { generateOrderId } from 'src/utils/function/uniqueOrderId';
import { Repository } from 'typeorm';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Checkout)
    private readonly checkoutRepository: Repository<Checkout>,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
  ) { }

 

  async createOrder(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error('User not found');
    }
    const checkout = await this.checkoutRepository.createQueryBuilder('checkout')
      .leftJoinAndSelect('checkout.cart', 'cart')
      .leftJoinAndSelect('cart.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('checkout.billingAddress', 'billingAddress')
      .leftJoinAndSelect('checkout.shippingAddress', 'shippingAddress')
      .where('checkout.user = :userId', { userId })

      .getOne();
    if (!checkout) {
      throw new Error('Checkout not found');
    }

   const  orderNumber =await this.orderRepository.count() + 1;

    console.log(checkout);
    const order = new Order();
    order.id= generateOrderId();
    order.total = checkout.total;
    order.shippingType = checkout.shippingType;
    order.deliveryCharges = checkout.deliveryCharges;
    order.orderNumber = orderNumber.toString();
    order.note = checkout.note;
    order.user = user;
    order.deliveryDate = checkout.deliveryDate;
    order.billingAddress = extractAddressData(checkout.billingAddress);
    order.shippingAddress = extractAddressData(checkout.shippingAddress);
    order.orderStatus = {
      scheduled: false, 
      scheduledDate: Date.now().toString(), 
      picked: false, 
      pickedDate: '', 
      washing: false, 
      washingDate: '', 
      delivered: false, 
      deliveredDate: checkout.deliveryDate 
  };
    order.orderDetail = checkout.cart.items.map(cartItem => {
      const orderDetail = new OrderDetail();
      orderDetail.quantity = cartItem.quantity;
      orderDetail.product = cartItem.product; 
      return orderDetail;
    });
    await this.orderRepository.save(order);
    await this.checkoutRepository.delete(checkout.id);
    await this.cartItemRepository.delete({ cart: checkout.cart.id });



    return {
      data: order,
      message: 'Order created successfully',
    };
  }

  

  

}
