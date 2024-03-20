/* eslint-disable prettier/prettier */
import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Order } from "./order.entity";

export enum PaymentStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
}

@Entity()
export class Payment extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50 })
    paymentType: string;

    @Column({ type: 'enum', default: PaymentStatus.PENDING, enum: PaymentStatus})
    paymentStatus: string;

    @Column({ type: 'varchar', length: 50, nullable: true})
    transactionId: string;


    @OneToOne(() => Order, (order) => order.payment)
    @JoinColumn({ name: 'orderId' })
    order: Order;

    
}