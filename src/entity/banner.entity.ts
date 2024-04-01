/* eslint-disable prettier/prettier */
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { BaseEntity } from "./base.entity";

@Entity()
export class Banner extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ nullable: true })
    imageKey: string;

    @Column({ nullable: true })
    bannerImage: string;

    @Column({ nullable: true })
    bannerName: string;

    @Column({ nullable: true })
    bannerDescription: string;

    
}