/* eslint-disable prettier/prettier */
// cart-item.dto.ts

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Product } from "src/entity";

export class CartItemDto {



    @ApiProperty({ example: 0, description: 'Quantity of the Product', required: true })
    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @ApiProperty({ example: 'uuid', description: 'id of Product', required: true })
    @IsNotEmpty()
    @IsString()
    product: Product; 



  }
  