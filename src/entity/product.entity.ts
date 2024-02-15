/* eslint-disable prettier/prettier */
// sub-category.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CategoryProduct } from './category_product.entity';
import { Favourite } from './favourite.entity';

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

  @Column()
  imageKey: string;

  @Column({default:false})
  isDeleted:boolean;

  @OneToMany(() => CategoryProduct,categoryProduct => categoryProduct.product )
  categoryProduct: CategoryProduct[];

  @OneToMany(() => Favourite, favourite => favourite.product_id)
  favourite: Favourite[];
}