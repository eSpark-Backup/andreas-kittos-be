import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Users } from './user.entity';
import { OrderItem } from './orderItem.entity';
import { OrderDetail } from './orderDetail.entity';

@Entity()
export class Order extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  orderNumber: string;

  //will be chagned to Table for Status
  @Column({ type: 'varchar', length: 50 })
  orderStatus: string;

  @ManyToOne(() => Users, (user) => user.orders)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  item: OrderItem[];

  @OneToOne(() => OrderDetail, (orderDetail) => orderDetail.order)
  orderDetail: OrderDetail;
}
