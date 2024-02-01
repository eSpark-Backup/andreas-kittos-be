/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { CategoryProduct } from './category_product.entity';

@Entity({ name: 'category' })
export class Category extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false, unique: true })
  name: string;

  @Column({ default: true })
  status: boolean;

  @Column({ default: 0 })
  is_parent: string;

  @Column({default:false})
  isDeleted:boolean;

  @OneToMany(() => CategoryProduct,categoryProduct => categoryProduct.category )
  categoryProduct: CategoryProduct[];

}