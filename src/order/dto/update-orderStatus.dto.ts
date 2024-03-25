/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import { orderByState } from "src/entity/order.entity";

/* eslint-disable prettier/prettier */

enum OrderState {
    Pending = 'pending',
    Processing = 'processing',
    Completed = 'completed',
    Cancelled = 'cancelled',
    Refunded = 'refunded',
    Failed = 'failed',
    OnHold = 'on-hold',


  }
export class UpdateOrderStatusDto {
    @ApiProperty({
        example: true,
        description: 'Schedule Progress of the order',
        required: false,
    })
    @IsBoolean()
    @IsOptional()

    scheduled?: boolean;

    @ApiProperty({
        example: true,
        description: 'Picked Up Progress of the order',
        required: false,
    })
    @IsBoolean()
    @IsOptional()

    picked?: boolean;

    @ApiProperty({
        example: true,
        description: 'Washing Progress of the order',
        required: false,
    })
    @IsBoolean()
    @IsOptional()

    washing?: boolean;

    @ApiProperty({
        example: true,
        description: 'Delivered Progress of the order',
        required: false,
    })
    @IsBoolean()
    @IsOptional()

    delivered?: boolean;


    @ApiProperty({
        example: 'pending',
        description: 'Current State of Order',
        required: false,
        type:'string',
        enum: orderByState,
    })
    @IsString()
    @IsOptional()

    orderState?: orderByState;


    @ApiProperty({
        example: 'Order is Picked By Rider',
        description: 'Reason to change the state of order',
        required: false,
        type:'string',
    })
    @IsString()
    @IsOptional()

    reason?: string;



   
}
