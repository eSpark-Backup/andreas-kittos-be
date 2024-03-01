import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {
  @ApiProperty({
    example: 'uuid',
    description: 'id of category',
    required: false,
  })
  @IsOptional()
  categoryIds: string;

  @ApiProperty({
    example: 'Product Name',
    description: 'Name of the product',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: 50,
    description: 'Price of the product',
    required: false,
  })
  @IsOptional()
  @IsString()
  price?: string;

  @ApiProperty({
    example: 10,
    description: 'Quantity available',
    required: false,
  })
  @IsOptional()
  @IsString()
  quantity?: string;

  @ApiProperty({
    example: 'Product description',
    description: 'Description of the product',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 'tag1, tag2',
    description: 'Tags associated with the product',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: 'Tags should not exceed 255 characters' })
  tags?: string;

  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'File to upload',
    required: false,
  })
  file?: any;

  productImage?: string;
  imageKey?: string;
}
