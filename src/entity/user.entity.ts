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
  first_name: string;

  @Column({nullable:true})
  last_name: string;

  @Column({nullable:true})
  profile_image: string;

  @Column({ unique: true, length: 100 ,nullable:true})
  email: string;

  @Column({nullable:true})
  password: string;

  @Column({ length: 15 ,nullable:true})
  phone_number: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column({default:false})
  is_verified: boolean;

  @Column({nullable:true})
  social_id: string;

  @Column({ type: 'text', nullable: true })
  password_reset_token: (() => string) | string;

}