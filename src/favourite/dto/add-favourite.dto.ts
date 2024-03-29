import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Product, Users } from 'src/entity';

export class FavouriteDto {
  @ApiProperty({
    example: 'uuid',
    description: 'id of product',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  productId: Product;

  userId: Users;
}
