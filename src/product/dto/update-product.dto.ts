import { IsString, IsOptional, MaxLength, IsDefined, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProductDto {

    @ApiProperty({ example: 'Product Name', description: 'Name of the product' })
    @IsOptional()
    // @IsString()
    name?: string;
  
    @ApiProperty({ example: 50, description: 'Price of the product' })
    @IsOptional()
    @IsString()
    price?: string;
  
    @ApiProperty({ example: 10, description: 'Quantity available' })
    @IsOptional()
    @IsString()
    quantity?: string;
  
    @ApiProperty({ example: 'Product description', description: 'Description of the product' })
    @IsOptional()
    @IsString()
    description?: string;
  
    @ApiProperty({ example: 'tag1, tag2', description: 'Tags associated with the product' })
    @IsOptional()
    @IsString()
    @MaxLength(255, { message: 'Tags should not exceed 255 characters' })
    tags?: string;
  
    @ApiProperty({ type: 'string', format: 'binary', description: 'File to upload' })
    file?: any;
  
    productImage?:string;
}
