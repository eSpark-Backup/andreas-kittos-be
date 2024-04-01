/* eslint-disable prettier/prettier */
import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateBannerDto{

    @ApiProperty({
    example:'Banner Name',
    description:'Name of the banner',
    required:true,
    })
    @IsNotEmpty()
    @IsString()
    bannerName:string;


    @ApiProperty({
    example:'Banner Description',
    description:'Description of the banner',
    required:true,
    })
    @IsNotEmpty()
    @IsString()
    bannerDescription:string;

    @ApiProperty({
        type: 'string',
        format: 'binary',
        description: 'File to upload',
        required: true,
      })
      file: any;

      bannerImage?:string;
        imageKey?:string;
}