import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { BackblazeService } from 'src/backblaze/backblaze.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from '../entity/product.entity';
import { Category } from '../entity/category.entity';
import { CategoryProduct } from '../entity/category_product.entity';


@Module({
  imports: [
    MulterModule.register({
      storage: multer.memoryStorage(),
    }),
  TypeOrmModule.forFeature([Product,Category,CategoryProduct])
  ],
  controllers: [ProductController],
  providers: [ProductService, BackblazeService],
})
export class ProductModule { }
