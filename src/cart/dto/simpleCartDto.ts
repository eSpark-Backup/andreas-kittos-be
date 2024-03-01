import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Product } from 'src/entity';

export class simpleCartDto {
  @ApiProperty({
    example: '1',
    description: 'Quantity of the product',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  quantity: number;

  @ApiProperty({
    example: '61205604-5107-4670-9c4a-1166ec72fceb',
    description: 'ID of the product',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  product: Product;
}
