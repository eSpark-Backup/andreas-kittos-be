/* eslint-disable prettier/prettier */
// favorite.entity.ts
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from './user.entity';
import { Product } from './product.entity';
import { BaseEntity } from './base.entity';

@Entity()
export class Favourite extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, user => user.favourite)
  @JoinColumn({ name: 'user_id' })
  user_id: Users;

  @ManyToOne(() => Product, product => product.favourite)
  @JoinColumn({ name: 'product_id' })
  product_id: Product;
}
