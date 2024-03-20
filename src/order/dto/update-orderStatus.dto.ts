/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsOptional } from "class-validator";

/* eslint-disable prettier/prettier */
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

}
