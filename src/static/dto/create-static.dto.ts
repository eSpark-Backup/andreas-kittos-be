/* eslint-disable prettier/prettier */

import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class StaticDTO {

    @ApiProperty({ example: 'Button  Name', description: 'Name of the Button', required: true })
    @IsNotEmpty()
    @IsString()
    key: string;

    @ApiProperty({ example: 'Content here', description: 'Description of the Static Content', required: true })
    @IsNotEmpty()
    @IsString()
    value: string;
}
