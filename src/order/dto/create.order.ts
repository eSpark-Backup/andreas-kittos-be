/* eslint-disable prettier/prettier */

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateOrderDto {

    @ApiProperty({
        example: 'Card',
        description: 'Method of Payment',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    paymentType: string;


    @ApiProperty({
        example: '1232131332',
        description: 'Transaction Id if payment is successful',
        required: false,
    })
    @IsOptional()
    @IsString()
    transactionId: string;


    @ApiProperty({
        example: 'Pending',
        description: 'Payment Status',
        required: false,
    })
    @IsOptional()
    @IsString()
    paymentStatus: string;



}
