import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CheckoutDto {
  @ApiProperty({ description: 'Total amount of the checkout', example: 100.0 })
  @IsNotEmpty({ message: 'Total cannot be empty' })
  total: number;

  @ApiProperty({
    description: 'Sub Total amount of the checkout',
    example: 100.0,
  })
  @IsNotEmpty({ message: 'Sub Total cannot be empty' })
  subTotal: number;

  @ApiProperty({
    description: 'Type of shipping (e.g., express, standard)',
    example: 'express',
  })
  @IsString({ message: 'Shipping type must be a string' })
  @IsNotEmpty({ message: 'Shipping type cannot be empty' })
  shippingType: string;

  @ApiProperty({ description: 'Delivery charges', example: '10.0' })
  @IsString({ message: 'Delivery charges must be a string' })
  @IsNotEmpty({ message: 'Delivery charges cannot be empty' })
  deliveryCharges: string;

  @ApiProperty({
    description: 'Note for the delivery',
    example: 'Please deliver before 5 PM',
  })
  @IsString({ message: 'Note must be a string' })
  @IsNotEmpty({ message: 'Note cannot be empty' })
  note: string;

  // @ApiProperty({ description: 'Delivery date', example: '2021-12-31' })
  // @IsString({ message: 'Delivery date must be a string' })
  // @IsNotEmpty({ message: 'Delivery date cannot be empty' })
  // deliveryDate: string;

  @ApiProperty({
    description: 'User ID associated with the checkout',
    example: 'c14a4d4e-97d5-4f5b-9c64-55b4fd92e08a',
  })
  @ApiProperty({
    description: 'Cart ID associated with the checkout',
    example: 'd3ec79c4-5089-475b-aee5-0d515d647dc9',
  })
  @IsString()
  @IsNotEmpty({ message: 'Cart ID cannot be empty' })
  cartId: string;

  @ApiProperty({
    description: 'Shipping address ID associated with the checkout',
    example: 'a125f9b0-d951-48d1-9e02-843e0b1a3789',
  })
  @IsString()
  @IsOptional({ message: 'If Null ,then default will be Selected' })
  shippingAddressId: string;
}
