import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';

enum AddressType {
  SHIPPING = 'shipping',
  BILLING = 'billing',
}

export class AddressDto {
  @ApiProperty({
    enum: AddressType,
    description: 'Type of address (e.g., billing, shipping)',
  })
  @IsEnum(AddressType, {
    message: 'Type must be either "shipping" or "billing"',
  })
  type: AddressType;

  @ApiProperty({ description: 'First name' })
  @IsNotEmpty({ message: 'First name cannot be empty' })
  @IsString({ message: 'First name must be a string' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsNotEmpty({ message: 'Last name cannot be empty' })
  @IsString({ message: 'Last name must be a string' })
  lastName: string;

  @ApiProperty({ description: 'Email address' })
  @IsNotEmpty({ message: 'Email cannot be empty' })
  @IsString({ message: 'Email must be a string' })
  email: string;

  @ApiProperty({ description: 'Phone number' })
  @IsNotEmpty({ message: 'Phone number cannot be empty' })
  @IsString({ message: 'Phone number must be a string' })
  phoneNumber: string;

  @ApiProperty({ description: 'Street address' })
  @IsNotEmpty({ message: 'Street cannot be empty' })
  @IsString({ message: 'Street must be a string' })
  street: string;

  @ApiProperty({ description: 'City name' })
  @IsNotEmpty({ message: 'City cannot be empty' })
  @IsString({ message: 'City must be a string' })
  city: string;

  @ApiProperty({ description: 'State or region' })
  @IsNotEmpty({ message: 'State cannot be empty' })
  @IsString({ message: 'State must be a string' })
  state: string;

  @ApiProperty({ description: 'Country name' })
  @IsNotEmpty({ message: 'Country cannot be empty' })
  @IsString({ message: 'Country must be a string' })
  country: string;

  @ApiProperty({ description: 'ZIP or postal code' })
  @IsNotEmpty({ message: 'ZIP code cannot be empty' })
  @IsString({ message: 'ZIP code must be a string' })
  zipCode: string;

  @ApiProperty({ description: 'Apartment number (optional)' })
  @IsOptional()
  @IsString({ message: 'Apartment must be a string' })
  apartment?: string;

  @ApiProperty({ description: 'Block number (optional)' })
  @IsOptional()
  @IsString({ message: 'Block must be a string' })
  block?: string;

  @ApiProperty({ description: 'Longitude (optional)' })
  @IsOptional()
  @IsString({ message: 'Longitude must be a string' })
  longitude?: string;

  @ApiProperty({ description: 'Latitude (optional)' })
  @IsOptional()
  @IsString({ message: 'Latitude must be a string' })
  latitude?: string;
}
