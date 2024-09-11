/* eslint-disable prettier/prettier */
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MaxLength,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    example: 'uuid',
    description: 'id of category',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  categoryIds: string;

  @ApiProperty({
    example: 'Product Name',
    description: 'Name of the product',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    example: 50,
    description: 'Price Range 2 of the product',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  price1: string;

  @ApiProperty({
    example: 50,
    description: 'Price Range 2 of the product',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  price2: string;

  @ApiProperty({
    example: 10,
    description: 'Quantity available',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  quantity: string;

  @ApiProperty({
    example: 'Product description',
    description: 'Description of the product',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({
    example: 'tag1, tag2',
    description: 'Tags associated with the product',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Tags should not exceed 255 characters' })
  tags?: string;

  @ApiProperty({ type: Boolean, default: false, required: false })
  isGeneral: boolean;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
    required: true,
  })
  file: any;

  productImage?: string;
  imageKey?: string;
  price?: string;
}
