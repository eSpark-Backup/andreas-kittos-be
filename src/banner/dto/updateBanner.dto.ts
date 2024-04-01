/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import {  IsOptional, IsString } from "class-validator";

export class UpdateBannerDto{

    @ApiProperty({
    example:'Banner Name',
    description:'Name of the banner',
    required:false,
    })
    @IsOptional()
    @IsString()
    bannerName:string;


    @ApiProperty({
    example:'Banner Description',
    description:'Description of the banner',
    required:false,
    })
    @IsOptional()
    @IsString()
    bannerDescription:string;

    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'File to upload',
        required:false,
          })
      file: any;

      bannerImage?:string;
        imageKey?:string;
}