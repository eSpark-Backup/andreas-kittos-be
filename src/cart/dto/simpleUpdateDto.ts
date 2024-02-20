/* eslint-disable prettier/prettier */
// simple-update.dto.ts
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class SimpleUpdateDto {
    @ApiProperty({ example: 0, description: 'Quantity of the Product', required: true })
    @IsNotEmpty()
    @IsNumber()
    quantity: number;

    @ApiProperty({ example: 'uuid', description: 'id of Product', required: true })
    @IsNotEmpty()
    @IsString()
    product: string;
}
