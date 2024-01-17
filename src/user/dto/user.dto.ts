/* eslint-disable prettier/prettier */
// src/user/dto/create-user.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, IsOptional, IsPhoneNumber } from 'class-validator';


export class CreateUserDto {

  
  @ApiProperty({ type: String })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name cannot be empty' })
  readonly first_name: string;

  @ApiProperty({ type: String })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  readonly last_name: string;

  @ApiProperty({ type: String })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  readonly user_name: string;

  @ApiProperty({ type: String ,default:'user@mail.com'})
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  readonly email: string;

  @ApiProperty({ type: String})
  @IsString({ message: 'Mobile number must be a string' })
  @IsNotEmpty({ message: 'Mobile number cannot be empty' })
  @IsOptional()
  readonly phone_number: string;

 
  @ApiProperty({ type: String ,required :false})
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  @IsOptional()
  readonly password: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  readonly social_id?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  readonly profile_image:string;

  readonly is_verified?: boolean;

}

export class LoginDto {
  @ApiProperty({ type: String })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  readonly email: string;

  @ApiProperty({ type: String })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  readonly password: string;

 
}

export class LinkEmailDto {
  @ApiProperty({ type: String })
  @IsEmail()
  to: string;

}
export class ResetPasswordwithMailDto {
  @ApiProperty({ type: String })
  @IsString()
  password: string;

  @ApiProperty({ type: String })
  @IsString()
  token: string;

}


export class SendOtpDto {
  @ApiProperty({ description: 'Phone number to which OTP will be sent' })
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('PK', { message: 'Invalid phone number' })
  readonly phoneNumber: string;
}

export class SendOtpDtoEmail {
  @ApiProperty({ type: String ,default:'user@mail.com',description: 'Email to which OTP will be sent'})
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  readonly email: string;
}

export class VerifyOtpDto {
  @ApiProperty({ description: 'Phone number for which OTP was sent' })
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('PK', { message: 'Invalid phone number' })
  readonly phoneNumber: string;

  @ApiProperty({ description: 'OTP to be verified' })
  @IsNotEmpty()
  @IsString()
  readonly otp: string;

  @ApiProperty({ description: 'Hash received during OTP generation' })
  @IsNotEmpty()
  @IsString()
  readonly hash: string;
}


export class VerifyOtpDtoEmail {
  @ApiProperty({ type: String ,default:'user@mail.com',description: 'Email to which OTP will be sent'})
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  readonly email: string;

  @ApiProperty({ description: 'OTP to be verified' })
  @IsNotEmpty()
  @IsString()
  readonly otp: string;

  @ApiProperty({ description: 'Hash received during OTP generation' })
  @IsNotEmpty()
  @IsString()
  readonly hash: string;
}