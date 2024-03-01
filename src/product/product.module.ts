import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { BackblazeService } from 'src/backblaze/backblaze.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, Category, CategoryProduct } from '../entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
    TypeOrmModule.forFeature([Product, Category, CategoryProduct]),
  ],
  controllers: [ProductController],
  providers: [ProductService, BackblazeService, JwtService],
})
export class ProductModule {}
