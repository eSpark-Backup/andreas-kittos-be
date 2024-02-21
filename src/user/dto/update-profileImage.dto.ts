/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";

export class updateProfileImageDto {
    @ApiProperty({ type: 'string', format: 'binary', description: 'File to upload', required: true })
    file: any;


    profileImage?: string;
    imageKey?: string;
}