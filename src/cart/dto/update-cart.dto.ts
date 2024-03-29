import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';
import { CartItemDto } from './cart-item.dto';

export class UpdateCartDTO {
  @ApiProperty({
    type: [CartItemDto],
    description: 'Array of cart items associated with the cart',
    required: true,
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CartItemDto)
  @IsOptional()
  items: CartItemDto[];
}
