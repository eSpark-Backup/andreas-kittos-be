import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { BaseEntity } from './base.entity';
import { CategoryProduct } from './category_product.entity';
import { Favourite } from './favourite.entity';
import { CartItem } from './cart_item.entity';

@Entity()
export class Product extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: false })
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

  @Column({ default: false })
  isDeleted: boolean;

  @OneToMany(
    () => CategoryProduct,
    (categoryProduct) => categoryProduct.product,
  )
  @JoinColumn({ name: 'categoryProduct' })
  categoryProduct: CategoryProduct[];

  @OneToMany(() => Favourite, (favourite) => favourite.productId)
  favourite: Favourite[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];
}
