/* eslint-disable prettier/prettier */
// cart.entity.ts

import { Entity, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Users } from './user.entity'; // Assuming the correct import
import { CartItem } from './cart_item.entity';
import { BaseEntity } from './base.entity';

@Entity()
export class Cart extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @ManyToOne(() => Users, user => user.carts)
    @JoinColumn({ name: 'userId' })
    user: Users;

    @OneToMany(() => CartItem, item => item.cart, { cascade: true })
    items: CartItem[];

    
}
