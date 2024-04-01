/* eslint-disable prettier/prettier */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Banner } from 'src/entity/banner.entity';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { BannerController } from './banner.controller';
import { BackblazeService } from 'src/backblaze/backblaze.service';
import { BannerService } from './banner.service';

@Module({
  imports: [
    MulterModule.register({
        storage: multer.memoryStorage(),
      }),
      
      TypeOrmModule.forFeature([Banner])],
  providers: [BannerService, JwtService, BackblazeService],
  controllers: [BannerController],
})
export class BannerModule {}
