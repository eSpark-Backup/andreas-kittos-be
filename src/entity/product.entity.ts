// sub-category.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true})
  name: string;

  @Column()
  price: string;

  @Column()
  quantity: string;

  @Column()
  description: string;

  @Column()
  tags: string;

  @Column()
  productImage: string;

  @Column({default:false})
  isDeleted:boolean
}