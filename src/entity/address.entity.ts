import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Users } from './user.entity';
import { BaseEntity } from './base.entity';
import { Checkout } from './checkout.entity';

export enum AddressType {
  BILLING = 'billing',
  SHIPPING = 'shipping',
}

@Entity()
export class Address extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AddressType, default: AddressType.SHIPPING })
  type: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  phoneNumber: string;

  @Column('json')
  address: {
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

  @Column({ default: true })
  isDefault: boolean;

  @ManyToOne(() => Users, (user) => user.address)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @OneToMany(() => Checkout, (checkout) => checkout.shippingAddress)
  shippingCheckouts: Checkout[];
}
