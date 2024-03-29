import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsNumberString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ type: String })
  @IsString({ message: 'First name must be a string' })
  @IsNotEmpty({ message: 'First name cannot be empty' })
  readonly firstName: string;

  @ApiProperty({ type: String })
  @IsString({ message: 'Last name must be a string' })
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  readonly lastName: string;

  @ApiProperty({ type: String, default: 'user@mail.com' })
  readonly email: string;

  @ApiProperty({ type: String })
  readonly phoneNumber: string;

  @ApiProperty({ type: String, required: false })
  readonly password: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  readonly socialId?: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  readonly profileImage: string;

  displayName?: string;

  readonly isVerified?: boolean;
}

export class UpdateUserDto {
  @ApiProperty({ type: String })
  @IsString({ message: 'First name must be a string' })
  @IsOptional()
  readonly firstName: string;

  @ApiProperty({ type: String })
  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  readonly lastName: string;

  @ApiProperty({ type: String, default: 'user@mail.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsOptional()
  readonly email: string;

  @ApiProperty({ type: String })
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({ type: String, required: false })
  @IsOptional()
  readonly displayName: string;
}

export class LoginDto {
  @ApiProperty({ type: String })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  readonly userCred: string;

  @ApiProperty({ type: String })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password cannot be empty' })
  readonly password: string;
}

export class LinkEmailDto {
  @ApiProperty({ type: String })
  emailPhone: string;
}
export class ResetPasswordwithMailDto {
  @ApiProperty({ type: String })
  @IsString()
  password: string;

  @ApiProperty({ description: 'OTP to be verified' })
  @IsNotEmpty()
  @IsString()
  readonly otp: string;

  @ApiProperty({ description: 'Hash received during OTP generation' })
  @IsNotEmpty()
  @IsString()
  readonly hash: string;

  @ApiProperty({ type: String })
  @IsNotEmpty()
  emailPhone: string;
}

export class SendOtpDto {
  @ApiProperty({ description: 'Phone number to which OTP will be sent' })
  @IsNotEmpty()
  @IsString()
  @IsPhoneNumber('PK', { message: 'Invalid phone number' })
  readonly phoneNumber: string;
}

export class SendOtpDtoEmail {
  @ApiProperty({
    type: String,
    default: 'user@mail.com',
    description: 'Email to which OTP will be sent',
  })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  readonly email: string;
}

export class VerifyOtpDto {
  @ApiProperty({ description: 'Email or Phone number for which OTP was sent' })
  @IsNotEmpty()
  @IsString()
  readonly emailPhone: string;

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
  @ApiProperty({
    type: String,
    default: 'user@mail.com',
    description: 'Email to which OTP will be sent',
  })
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

export class resendEmailDto {
  @ApiProperty({ type: String, description: 'email required' })
  @IsEmail()
  email: string;
}
