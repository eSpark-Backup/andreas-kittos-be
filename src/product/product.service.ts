import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BackblazeService } from '../backblaze/backblaze.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entity/product.entity';
import { Category } from '../entity/category.entity';
import { CategoryProduct } from '../entity/category_product.entity';
import { CONSTANT_RESPONSE } from '../utils/constant/return.constant';
import * as url from 'url';
import * as path from 'path';

@Injectable()
export class ProductService {
  constructor(
    private readonly backblazeService: BackblazeService,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(CategoryProduct)
    private productCategoryRepository: Repository<CategoryProduct>,
  ) { }

  async create(file: any, createProductDto: CreateProductDto) {
    const uploadResult = await this.backblazeService.uploadFileFromBuffer(file.fileBuffer, file.originalName);
    const category = new Category();
    category.id = createProductDto.categoryId;
    delete createProductDto.categoryId;
    createProductDto.productImage = `${uploadResult.url}:$:${uploadResult.fileId}`;
    const createProductRes = await this.productRepository.save(createProductDto);
    const categoryProduct = new CategoryProduct();
    categoryProduct.product = createProductRes;
    categoryProduct.category = category;
    await this.productCategoryRepository.save(categoryProduct);
    return {
      data: createProductRes,
      message: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    };
  }

  async findAll() {
    const allProductResult = await this.productRepository.find({
      where: { isDeleted: false },
    });
    return { data: allProductResult, message: CONSTANT_RESPONSE.GET_ALL };
  }

  async findOne(id: string) {
    const productResult = await this.productRepository.findOne({
      where: { id: id, isDeleted: false },
    });
    const result = productResult
      ? { data: productResult, message: CONSTANT_RESPONSE.RECORD_FOUND }
      : {
        data: productResult,
        message: CONSTANT_RESPONSE.RECORD_NOT_FOUND,
        status: false,
      };
    return result;
  }

  async update(id: string, updateProductDto: UpdateProductDto, file: any) {
    const result = await this.productRepository.findOne({ where: { id, isDeleted: false } });
    if (!result) {
      return {
        data: null,
        message: CONSTANT_RESPONSE.UPDATE_REJECTION,
        status: false,
      };
    }
    if (file.originalName !== undefined) {
      const parts = result.productImage.split(':$:');
      await this.backblazeService.deleteFile(path.basename(url.parse(parts[0]).pathname),parts[1]);
      const uploadResult = await this.backblazeService.uploadFileFromBuffer(file.fileBuffer, file.originalName);
      updateProductDto.productImage = `${uploadResult.url}:$:${uploadResult.fileId}`;
    }
    const { affected } = await this.productRepository.update(
      id,
      updateProductDto,
    );
    if (affected === 1) {
      return { data: null, message: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY };
    }
    return {
      data: null,
      message: CONSTANT_RESPONSE.UPDATE_REJECTION,
      status: false,
    };
  }

  async remove(id: number) {
    const { affected } = await this.productRepository.update(id, { isDeleted: true });
    if (affected === 1) {
      return { data: null, message: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY };
    }
    return {
      data: null,
      message: CONSTANT_RESPONSE.DELETE_FAILED,
      status: false,
    };
  }
}
