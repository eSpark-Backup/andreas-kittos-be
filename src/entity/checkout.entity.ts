import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Users } from './user.entity';
import { Cart } from './cart.entity';
import { Address } from './address.entity';
import { BaseEntity } from './base.entity';

@Entity()
export class Checkout extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  total: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  subTotal: number;

  @Column({ type: 'varchar', length: 50 })
  shippingType: string;

  @Column({ type: 'varchar' })
  deliveryCharges: string;

  @Column({ type: 'varchar' })
  note: string;

  @Column({ type: 'varchar' })
  deliveryDate: string;

  @ManyToOne(() => Users, (user) => user.checkouts)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @OneToOne(() => Cart, (cart) => cart.checkouts)
  @JoinColumn({ name: 'cartId' })
  cart: Cart;

  @ManyToOne(() => Address, (address) => address.shippingCheckouts)
  @JoinColumn({ name: 'shippingAddressId' })
  shippingAddress: Address;
}
