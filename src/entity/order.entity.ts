/* eslint-disable prettier/prettier */
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Users } from './user.entity';
import { OrderDetail } from './orderDetail.entity';
import { Payment } from './payment.entity';

@Entity()
export class Order extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @Column({ type: 'varchar', length: 50 })
  orderNumber: string;

  @Column('json')
  orderStatus: {
    scheduled: boolean;
    scheduledDate: string;
    picked: boolean;
    pickedDate: string;
    washing: boolean;
    washingDate: string;
    delivered: boolean;
    deliveredDate: string;
  };


  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'varchar', length: 50 })
  shippingType: string;

  @Column({ type: 'varchar' })
  deliveryCharges: string;

  @Column({ type: 'varchar' })
  note: string;

  @Column({ type: 'varchar' })
  deliveryDate: string;

  @Column({ type: 'varchar' ,default: 'pending'})
  orderState: string;

  @OneToOne(() => Payment, (payment) => payment.order, { cascade: true })
  payment: Payment;

  @Column('json')
  billingAddress: {
    name: string;
    email: string;
    phoneNumber: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    apartment?: string;
    block?: string;
    longitude?: string;
    latitude?: string;
  };

  @Column('json')
  shippingAddress: {
    name: string;
    email: string;
    phoneNumber: string;
    street: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    apartment?: string;
    block?: string;
    longitude?: string;
    latitude?: string;
  };

  @ManyToOne(() => Users, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @OneToMany(() => OrderDetail, (orderDetail) => orderDetail.order, { cascade: true })
  orderDetail: OrderDetail[];



}

// addressId,userId,shippingAddress,billingAddress,note,deliveryDate,deliveryCharges,shippingType,status 
