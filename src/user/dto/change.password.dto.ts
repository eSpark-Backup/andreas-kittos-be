/* eslint-disable prettier/prettier */
import { ApiProperty } from '@nestjs/swagger';
import {  IsNotEmpty, IsString } from 'class-validator';

export class ChangePasswordDto {
    @ApiProperty({
        example: 'abc123',
        description: 'Old Password of User',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    oldPassword: string;

    @ApiProperty({
        example: 'abc124',
        description: 'New Password of User',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    newPassword: string;

}


