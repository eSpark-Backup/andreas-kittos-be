import {
  Entity,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Checkout, CartItem, Users } from '.';

@Entity()
export class Cart extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, (user) => user.carts)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @OneToMany(() => CartItem, (item) => item.cart, { cascade: true })
  items: CartItem[];

  @OneToOne(() => Checkout)
  @JoinColumn()
  checkouts: Checkout;
}
