/* eslint-disable prettier/prettier */
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Entity()
@Index('IDX_user_email', ['email'])
export class Users extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({nullable:true})
  firstName: string;

  @Column({nullable:true})
  lastName: string;

  @Column({nullable:true})
  profileImage: string;

  @Column({ unique: true, length: 100 ,nullable:true})
  email: string;

  @Column({nullable:true})
  password: string;

  @Column({ length: 15 ,nullable:true})
  phoneNumber: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({default:false})
  isVerified: boolean;

  @Column({nullable:true})
  socialId: string;
}