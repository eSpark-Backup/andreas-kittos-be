import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BackblazeService } from '../backblaze/backblaze.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, Category, CategoryProduct, Favourite } from '../entity';
import { CONSTANT_RESPONSE } from '../utils/constant/return.constant';
import * as url from 'url';
import * as path from 'path';
import { paginateResponse } from '../utils/function/pagination';
import { CacheService } from 'src/utils/cache/cache.service';

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

    @InjectRepository(Favourite)
    private favouriteRepository: Repository<Favourite>,

    private cacheService: CacheService,
  ) {}

  async create(file: any, createProductDto: CreateProductDto) {
    const uploadResult = await this.backblazeService.uploadFileFromBuffer(
      file.fileBuffer,
      file.originalName,
    );
    const categoryIds = createProductDto.categoryIds;
    delete createProductDto.categoryIds;
    createProductDto.productImage = uploadResult.url;
    createProductDto.imageKey = uploadResult.fileId;
    const createProductRes =
      await this.productRepository.save(createProductDto);
    categoryIds.split(',').forEach(async (cId) => {
      const category = new Category();
      category.id = cId;
      const categoryProduct = new CategoryProduct();
      categoryProduct.product = createProductRes;
      categoryProduct.category = category;
      await this.productCategoryRepository.save(categoryProduct);
    });
    return {
      message: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    };
  }

  async productDetail(productId: string) {
    const result = await this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.categoryProduct', 'categoryProduct')
      .leftJoinAndSelect('categoryProduct.category', 'category')
      .where(`product.id = '${productId}'`)
      .andWhere('category.isDeleted = false')
      .andWhere('product.isDeleted = false')
      .getMany();
    return { data: result, message: CONSTANT_RESPONSE.RECORD_FOUND };
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
    const result = await this.productRepository.findOne({
      where: { id, isDeleted: false },
    });

    if (!result) {
      return {
        data: null,
        message: CONSTANT_RESPONSE.UPDATE_REJECTION,
        status: false,
      };
    }
    if (updateProductDto.categoryIds) {
      const category = new Category();
      category.id = updateProductDto.categoryIds;
      const product = new Product();
      product.id = id;
      const getProductCategory = await this.productCategoryRepository.findOne({
        where: { category, product },
      });
      if (!getProductCategory) {
        await this.productCategoryRepository.delete({ product: { id } });
        const categoryProduct = new CategoryProduct();
        categoryProduct.product = product;
        categoryProduct.category = category;
        await this.productCategoryRepository.save(categoryProduct);
      }
    }
    if (file.originalName !== undefined) {
      await this.backblazeService.deleteFile(
        path.basename(url.parse(result.productImage).pathname),
        result.imageKey,
      );
      const uploadResult = await this.backblazeService.uploadFileFromBuffer(
        file.fileBuffer,
        file.originalName,
      );
      updateProductDto.productImage = uploadResult.url;
      updateProductDto.imageKey = uploadResult.fileId;
    }
    delete updateProductDto.file;
    delete updateProductDto.categoryIds;
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
    const { affected } = await this.productRepository.update(id, {
      isDeleted: true,
    });
    if (affected === 1) {
      return { data: null, message: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY };
    }
    return {
      data: null,
      message: CONSTANT_RESPONSE.DELETE_FAILED,
      status: false,
    };
  }

  async categoryProduct(
    userId: string,
    categoryId: string,
    productName: string,
    minPrice: string,
    maxPrice: string,
    page: number,
    take: number,
  ) {
    const queryToGetData = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.categoryProduct', 'categoryProduct')
      .leftJoinAndSelect('categoryProduct.product', 'product')
      .where(`category.id = '${categoryId}'`)
      .andWhere('category.isDeleted = false')
      .andWhere('product.isDeleted = false');
    const queryToGetCount = this.productCategoryRepository
      .createQueryBuilder('productCategory')
      .leftJoinAndSelect('productCategory.category', 'category')
      .leftJoinAndSelect('productCategory.product', 'product')
      .where(`productCategory.category ='${categoryId}'`)
      .andWhere('category.isDeleted = false')
      .andWhere('product.isDeleted = false');

    if (productName != null) {
      queryToGetData.andWhere(`product.name = '${productName}'`);
      queryToGetCount.andWhere(`product.name = '${productName}'`);
    }
    if (maxPrice != null && minPrice != null) {
      queryToGetData.andWhere(
        `CAST(product.price AS NUMERIC) BETWEEN ${minPrice} AND ${maxPrice}`,
      );
      queryToGetCount.andWhere(
        `CAST(product.price AS NUMERIC) BETWEEN ${minPrice} AND ${maxPrice}`,
      );
    }

    const skip = (page - 1) * take;
    const [query, totalCount] = await Promise.all([
      queryToGetData
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
        .limit(take)
        .offset(skip)
        .orderBy('product.createdAt', 'DESC')
        .getMany(),
      queryToGetCount.getCount(),
    ]);

    const cachedData = await this.cacheService.get<string[]>(
      `favouriteProductIds_${userId}`,
    );
    let favouriteProductIds;
    if (cachedData) {
      favouriteProductIds = cachedData;
    } else {
      favouriteProductIds =
        cachedData ||
        (
          await this.favouriteRepository
            .createQueryBuilder('favourite')
            .select('favourite.productId')
            .where('favourite.userId = :userId', { userId })
            .getRawMany()
        ).map((favourite) => favourite.productId);

      await this.cacheService.setWithExpiration(
        `favouriteProductIds_${userId}`,
        favouriteProductIds,
        300,
      );
    }

    query.forEach((category) => {
      category.categoryProduct.forEach((categoryProduct) => {
        categoryProduct.product['isFavourite'] = favouriteProductIds.includes(
          categoryProduct.product.id,
        );
      });
    });

    return {
      data: paginateResponse({ query, totalCount, take, page }),
      message: CONSTANT_RESPONSE.RECORD_FOUND,
    };
  }
}
