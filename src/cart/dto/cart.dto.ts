import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CartItemDto } from './cart-item.dto'; // Ensure correct import path

export class CartDto {
  @ApiProperty({
    type: [CartItemDto], // Specify the type as an array of CartItemDto
    description: 'Array of cart items associated with the cart',
    required: true,
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  items: CartItemDto[];
}
