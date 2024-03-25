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

export enum orderByState {
  pending = 'pending',
  processing = 'processing',
  completed = 'completed',
  cancelled = 'cancelled',
  refunded = 'refunded',
  failed = 'failed',
  onhold = 'on-hold',
}
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
    scheduledReason: string;
    picked: boolean;
    pickedDate: string;
    pickedReason: string;
    washing: boolean;
    washingDate: string;
    washingReason: string;
    delivered: boolean;
    deliveredDate: string;
    deliveredReason: string;
  };


  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true})
  subTotal: number;

  @Column({ type: 'varchar', length: 50 })
  shippingType: string;

  @Column({ type: 'varchar' })
  deliveryCharges: string;

  @Column({ type: 'varchar' })
  note: string;

  @Column({ type: 'varchar' })
  deliveryDate: string;

  @Column({ type: 'enum', enum: orderByState, default: orderByState.pending })
  orderState: orderByState;

  @OneToOne(() => Payment, (payment) => payment.order, { cascade: true })
  payment: Payment;


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
