import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateAddressDto {
  @ApiProperty({
    type: String,
    description: 'Type of address (e.g., billing, shipping)',
  })
  @IsString({ message: 'Type must be a string' })
  @IsOptional()
  type: string;

  @ApiProperty({ description: 'First name' })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  firstName: string;

  @ApiProperty({ description: 'Last name' })
  @IsString({ message: 'Last name must be a string' })
  @IsOptional()
  lastName: string;

  @ApiProperty({ description: 'Email address' })
  @IsString({ message: 'Email must be a string' })
  @IsOptional()
  email: string;

  @ApiProperty({ description: 'Phone number' })
  @IsString({ message: 'Phone number must be a string' })
  @IsOptional()
  phoneNumber: string;

  @ApiProperty({ description: 'Street address' })
  @IsOptional()
  @IsString({ message: 'Street must be a string' })
  street: string;

  @ApiProperty({ description: 'City name' })
  @IsOptional()
  @IsString({ message: 'City must be a string' })
  city: string;

  @ApiProperty({ description: 'State or region' })
  @IsOptional()
  @IsString({ message: 'State must be a string' })
  state: string;

  @ApiProperty({ description: 'Country name' })
  @IsOptional()
  @IsString({ message: 'Country must be a string' })
  country: string;

  @ApiProperty({ description: 'ZIP or postal code' })
  @IsOptional()
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
