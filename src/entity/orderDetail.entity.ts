import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Address } from './address.entity';
import { Order } from './order.entity';

@Entity()
export class OrderDetail {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @ManyToOne(() => Address, (address) => address.orderDetailBillingAdd)
  @JoinColumn({ name: 'billingAddressId' })
  billingAddress: Address;

  @ManyToOne(() => Address, (address) => address.orderDetailShippingAdd)
  @JoinColumn({ name: 'shippingAddressId' })
  shippingAddress: Address;

  @OneToOne(() => Order, (Order) => Order.orderDetail)
  @JoinColumn({ name: 'orderId' })
  order: Order;
}
