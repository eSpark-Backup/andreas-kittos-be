import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from './user.entity';
import { Product } from './product.entity';
import { BaseEntity } from './base.entity';

@Entity()
export class Favourite extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Users, (user) => user.favourite)
  @JoinColumn({ name: 'userId' })
  userId: Users;

  @ManyToOne(() => Product, (product) => product.favourite)
  @JoinColumn({ name: 'productId' }) 
  productId: Product;
}
