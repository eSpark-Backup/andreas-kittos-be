/* eslint-disable prettier/prettier */
// static.entity.ts
import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity()
export class Static extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column( {nullable:true})
    key: string;


    @Column({nullable:true})
    value: string;
}
