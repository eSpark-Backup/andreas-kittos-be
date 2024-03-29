import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Product } from './product.entity';
import { BaseEntity } from './base.entity';
import { Order } from './order.entity';

@Entity()
export class OrderDetail extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: number;

  @Column()
  quantity: number;

  @ManyToOne(() => Order, (order) => order.orderDetail)
  @JoinColumn({ name: 'orderId' })
  order: string;

  @ManyToOne(() => Product, (product) => product.cartItems)
  @JoinColumn({ name: 'productId' })
  product: Product;
}
