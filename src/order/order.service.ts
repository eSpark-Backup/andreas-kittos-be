/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CartItem, Checkout, Users } from 'src/entity';
import { Order } from 'src/entity/order.entity';
import { OrderDetail } from 'src/entity/orderDetail.entity';
import { extractAddressData } from 'src/utils/function/extractAddress';
import { generateOrderId } from 'src/utils/function/uniqueOrderId';
import { Repository } from 'typeorm';
import { UpdateOrderStatusDto } from './dto/update-orderStatus.dto';
import { CreateOrderDto } from './dto/create.order';
import { Payment } from 'src/entity/payment.entity';
import { paginateResponse } from 'src/utils/function/pagination';
import { CONSTANT_RESPONSE } from 'src/utils/constant/return.constant';

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
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
  ) { }



  async createOrder(userId: string, createOrderDto: CreateOrderDto) {

    const { transactionId, paymentStatus, paymentType } = createOrderDto;
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

    const orderNumber = await this.orderRepository.count() + 1;

    console.log(checkout);
    const order = new Order();
    order.id = generateOrderId();
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
      scheduled: true,
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
    order.payment = new Payment();
    order.payment.transactionId = transactionId;
    order.payment.paymentStatus = paymentStatus;
    order.payment.paymentType = paymentType;


    await this.orderRepository.save(order);
    await this.checkoutRepository.delete(checkout.id);
    await this.cartItemRepository.delete({ cart: checkout.cart.id });



    return {
      data: order,
      message: 'Order created successfully',
    };
  }

  async updateOrderStatus(orderId: string, updateOrderStatusDto: UpdateOrderStatusDto) {
    const order = await this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.orderDetail', 'orderDetail')
      .leftJoinAndSelect('orderDetail.product', 'product')
      .leftJoinAndSelect('order.payment', 'payment')
      .where('order.id = :orderId', { orderId })
      .getOne();
    const { scheduled, picked, washing, delivered, orderState } = updateOrderStatusDto;
    if (!order) {
      throw new Error('Order not found');
    }

    if (orderState !== undefined) {
      order.orderState = orderState;
    }
    if (scheduled !== undefined) {
      order.orderStatus.scheduled = scheduled;
    }
    if (picked !== undefined) {
      order.orderStatus.picked = picked;
      order.orderStatus.pickedDate = Date.now().toString();

    }
    if (washing !== undefined) {
      order.orderStatus.washing = washing;
      order.orderStatus.washingDate = Date.now().toString();

    }
    if (delivered !== undefined) {
      order.orderStatus.delivered = delivered;
      order.orderStatus.deliveredDate = Date.now().toString();

    }
    await this.orderRepository.save(order);
    return {
      data: order,
      message: 'Order status updated successfully',
    };
  }

  async orderList(page: number, take: number, userId: string, orderState: string, paymentStatus: string) {
    const queryToGetData = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.orderDetail', 'orderDetail')
      .leftJoinAndSelect('orderDetail.product', 'product')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.payment', 'payment')

    const queryToGetCount =
      this.orderRepository.createQueryBuilder('order')

    const skip = (page - 1) * take;


    //Error in QUERY Ahmed bhai s poochna hy k paymentStatus k liye kya karna hy
//    if (paymentStatus !== undefined) {
//     // Assuming paymentStatus is a column in the payment table
//     queryToGetData
//         .andWhere('payment.paymentType = :paymentType', { paymentType: 'COD' });
//     queryToGetCount
//         .andWhere('payment.paymentType = :paymentType', { paymentType: 'COD' });
// }
//     console.log(queryToGetData.getSql());

    if (userId !== undefined) {
      queryToGetData.andWhere('userId = :userId', { userId });
      queryToGetCount.andWhere('userId = :userId', { userId });
    }
    if (orderState !== undefined) {
      queryToGetData.andWhere('orderState = :orderState', { orderState });
      queryToGetCount.andWhere('orderState = :orderState', { orderState });
    }

    const [query, totalCount] = await Promise.all([

      queryToGetData.select([
        'order.id',
        'order.orderNumber',
        'order.orderStatus',
        'order.total',
        'order.shippingType',
        'order.deliveryCharges',
        'order.note',
        'order.deliveryDate',
        'order.orderState',
        'payment.id',
        'payment.transactionId',
        'payment.paymentStatus',
        'payment.paymentType',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.phoneNumber',
        'orderDetail.id',
        'orderDetail.quantity',
        'product.id',
        'product.name',
        'product.price',
        'product.productImage',
      ])

        .limit(take)
        .offset(skip)
        .orderBy('order.createdAt', 'DESC')
        .getMany(),
      queryToGetCount.getCount(),
    ]);



    return {
      data: paginateResponse({ query, totalCount, take, page }),
      message: 'Order list',
    };
  }

  async userOrderDetail(userId: string, page: number, take: number, orderState: string) {
    const queryToGetData = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.orderDetail', 'orderDetail')
      .leftJoinAndSelect('orderDetail.product', 'product')
      .leftJoinAndSelect('order.payment', 'payment')
      .leftJoinAndSelect('order.user', 'user')
      .andWhere('user.id = :userId', { userId });



    const queryToGetCount =
      this.orderRepository.createQueryBuilder('order')


    if (orderState) {
      queryToGetData.andWhere('order.orderState = :orderState', { orderState });
      queryToGetCount.andWhere('order.orderState = :orderState', { orderState });

    }
    const skip = (page - 1) * take;

    const [query, totalCount] = await Promise.all([

      queryToGetData.select([
        'order.id',
        'order.orderNumber',
        'order.orderStatus',
        'order.total',
        'order.shippingType',
        'order.deliveryCharges',
        'order.note',
        'order.deliveryDate',
        'order.orderState',
        'payment.transactionId',
        'payment.paymentStatus',
        'payment.paymentType',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.phoneNumber',
        'orderDetail.id',
        'orderDetail.quantity',
        'product.id',
        'product.name',
        'product.price',
        'product.productImage',
      ])

        .limit(take)
        .offset(skip)
        .orderBy('order.createdAt', 'DESC')
        .getMany(),
      queryToGetCount.getCount(),
    ]);

    return {
      data: paginateResponse({ query, totalCount, take, page }),
      message: 'Order detail',
    };
  }


  async orderDetail(orderId: string) {
    const order = await this.orderRepository.findOne({ where: { id: orderId } });
    if (!order) {
      throw new Error('Order not found');
    }
    return {
      data: order,
      message: 'Order detail',
    };
  }

  async paymentStatus(id: string, paymentStatus: string) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) {
      return {
        data: null,
        message: CONSTANT_RESPONSE.NOT_EXSIST

      }
    }
    const payment = await this.paymentRepository.createQueryBuilder('payment')
      .where('payment.order = :orderId', { orderId: order.id })
      .getOne();

    if (!payment) {
      return {
        data: null,
        message: CONSTANT_RESPONSE.NOT_EXSIST

      }
    }
    payment.paymentStatus = paymentStatus
    await this.paymentRepository.save(payment);

    return {
      data: payment,
      message: CONSTANT_RESPONSE.PAYMENT_SUCCESS
    };
  }






}
