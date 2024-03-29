/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class userStatusDto {
    @ApiProperty({
        example: 'active',
        description: 'Status of User',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    userStatus: string;

}
