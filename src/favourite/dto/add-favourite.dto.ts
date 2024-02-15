/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Product, Users } from "src/entity";

/* eslint-disable prettier/prettier */
export class addFavouriteDto {
    @ApiProperty({ example: 'uuid', description: 'id of product', required: true })
    @IsNotEmpty()
    @IsString()
    product_id: Product;
  
    @ApiProperty({ example: 'uuid', description: 'id of user', required: true })
    @IsNotEmpty()
    @IsString()
    user_id: Users;
  }
  