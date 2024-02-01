import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BackblazeService } from '../backblaze/backblaze.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, Category, CategoryProduct } from '../entity';
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
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) { }

  async create(file: any, createProductDto: CreateProductDto) {
    const uploadResult = await this.backblazeService.uploadFileFromBuffer(file.fileBuffer, file.originalName);
    const categoryIds = createProductDto.categoryIds;
    delete createProductDto.categoryIds;
    createProductDto.productImage = `${uploadResult.url}:$:${uploadResult.fileId}`;
    const createProductRes = await this.productRepository.save(createProductDto);
    categoryIds.split(',').forEach(async (cId) => {
      const category = new Category();
      category.id = cId;
      const categoryProduct = new CategoryProduct();
      categoryProduct.product = createProductRes;
      categoryProduct.category = category;
      await this.productCategoryRepository.save(categoryProduct);
    })
    return {
      message: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    };
  }

  async productDetail(productId:string) {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categoryProduct', 'categoryProduct')
      .leftJoinAndSelect('categoryProduct.category', 'category')
      .where(`product.id = '${productId}'`)
      .andWhere('category.isDeleted = false')
      .andWhere('product.isDeleted = false')
      .getMany();
    return { data: result, message: CONSTANT_RESPONSE.RECORD_FOUND }
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
      await this.backblazeService.deleteFile(path.basename(url.parse(parts[0]).pathname), parts[1]);
      const uploadResult = await this.backblazeService.uploadFileFromBuffer(file.fileBuffer, file.originalName);
      updateProductDto.productImage = `${uploadResult.url}:$:${uploadResult.fileId}`;
    }
    delete updateProductDto.file;
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

  async remove(id: string) {
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

  async categoryProduct(categoryId: string) {
    const result = await this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.categoryProduct', 'categoryProduct')
      .leftJoinAndSelect('categoryProduct.product', 'product')
      .where(`category.id = '${categoryId}'`)
      .andWhere('category.isDeleted = false')
      .andWhere('product.isDeleted = false')
      .select([
        'categoryProduct.id',
        'category.id',
        'category.name',
        'product.id',
        'product.name',
        'product.price',
        'product.quantity',
        'product.description',
        'product.tags',
        'product.productImage',
        'product.isDeleted',
      ])
      .getMany();
    return { data: result, message: CONSTANT_RESPONSE.RECORD_FOUND }
  }
}
