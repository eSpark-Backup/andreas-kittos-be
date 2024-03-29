import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { BackblazeService } from 'src/backblaze/backblaze.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product, Category, CategoryProduct, Favourite } from '../entity';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from 'src/utils/cache/cache.service';

@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
    TypeOrmModule.forFeature([Product, Category, CategoryProduct, Favourite]),
  ],
  controllers: [ProductController],
  providers: [ProductService, BackblazeService, JwtService, CacheService],
})
export class ProductModule {}
