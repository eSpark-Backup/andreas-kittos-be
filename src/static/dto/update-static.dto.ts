/* eslint-disable prettier/prettier */

import { ApiProperty } from "@nestjs/swagger";
import {  IsOptional } from "class-validator";

export class updateStaticDTO {

    @ApiProperty({ example: 'Button  Name', description: 'Name of the Button', required: false })
    @IsOptional()
    key: string;

    @ApiProperty({ example: 'Content here', description: 'Description of the Static Content',  required: false })
    @IsOptional()
    value: string;
}
