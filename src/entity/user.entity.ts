/* eslint-disable prettier/prettier */
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { Checkout, Address, Cart, Favourite } from '.';
import { Order } from './order.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
@Index('IDX_user_email', ['email'])
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  profileImage: string;

  @Column({ nullable: true })
  imageKey: string;

  @Column({ unique: true, length: 100, nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @Column({ unique: true, length: 15, nullable: true })
  phoneNumber: string;

  @Column({ default: 'active' })
  userStatus:string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({ default: false })
  isVerified: boolean;

  @Column({ nullable: true, })
  socialId: string;

  @OneToMany(() => Favourite, (favourite) => favourite.userId)
  favourite: Favourite[];

  @OneToMany(() => Cart, (cart) => cart.user)
  carts: Cart[];

  @OneToMany(() => Address, (address) => address.user)
  address: Address[];

  @OneToMany(() => Checkout, (checkout) => checkout.user)
  checkouts: Checkout[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];
}
