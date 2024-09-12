/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { BackblazeService } from '../backblaze/backblaze.service';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Not, Repository } from 'typeorm';
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
    try {
      const category = await this.categoryRepository
        .createQueryBuilder('category')
        .where('category.id = :id', { id: createProductDto.categoryIds })
        .getOne();
      if (!category) {
        return {
          data: null,
          message: CONSTANT_RESPONSE.NOT_EXSIST,
          status: false,
        };
      }
      const findsameNameProduct = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.categoryProduct', 'categoryProduct')
        .leftJoinAndSelect('categoryProduct.category', 'category')
        .where(`product.name = '${createProductDto.name}'`)
        .andWhere(`category.id = '${createProductDto.categoryIds}'`)
        .andWhere('category.isDeleted = false')
        .andWhere('product.isDeleted = false')
        .getOne();

      if (findsameNameProduct) {
        return {
          data: null,
          message: 'Product with same name already exists in this category',
          status: false,
        };
      }

      const uploadResult = await this.backblazeService.uploadFileFromBuffer(
        file.fileBuffer,
        file.originalName,
      );

      let categoryIds = createProductDto.categoryIds;
      if (String(createProductDto.isGeneral) === 'true') {
        const generalId = await this.categoryRepository.findOne({
          where: { name: 'General' },
        });
        categoryIds += ',' + generalId.id;
      }
      delete createProductDto.categoryIds;
      delete createProductDto.isGeneral;
      createProductDto.price =
        createProductDto.price1 + '-' + createProductDto.price2;
      delete createProductDto.price1;
      delete createProductDto.price2;

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
        status: true,
      };
    } catch (error) {
      return {
        data: null,
        message: CONSTANT_RESPONSE.CREATE_REJECTION,
        status: false,
      };
    }
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

    result.forEach((result) => {
      result['isGeneral'] = result.categoryProduct.some((categoryProduct) => {
        return categoryProduct.category.name === 'General';
      });
    });
    return { data: result, message: CONSTANT_RESPONSE.RECORD_FOUND };
  }

  async findOne(id: string) {
    const productResult = await this.productRepository.findOne({
      where: { id: id, isDeleted: false },
    });
    //change the price to price1 and price2
    if (productResult.price) {
      productResult['price1'] = productResult.price.split('-')[0];
      productResult['price2'] = productResult.price.split('-')[1];
      delete productResult.price;
    }
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
    if (String(updateProductDto.isGeneral) === 'true') {
      const generalId = await this.categoryRepository.findOne({
        where: { name: 'General' },
      });
      const category = new Category();
      category.id = generalId.id;
      const product = new Product();
      product.id = id;
      const getProductCategory = await this.productCategoryRepository.findOne({
        where: { category, product },
      });
      if (!getProductCategory) {
        const categoryProduct = new CategoryProduct();
        categoryProduct.product = product;
        categoryProduct.category = category;
        await this.productCategoryRepository.save(categoryProduct);
      }
    }

    if (String(updateProductDto.isGeneral) === 'false') {
      const generalId = await this.categoryRepository.findOne({
        where: { name: 'General' },
      });
      const category = new Category();
      category.id = generalId.id;
      const product = new Product();
      product.id = id;
      const getProductCategory = await this.productCategoryRepository.findOne({
        where: { category, product },
      });
      if (getProductCategory) {
        await this.productCategoryRepository
          .createQueryBuilder()
          .delete()
          .from(CategoryProduct)
          .where('id = :id', { id: getProductCategory.id })
          .execute();
      }
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
        const productCategory = await this.productCategoryRepository.find({
          where: {
            product: { id: product.id },
          },
          relations: ['category'],
        });
        const filteredCategories = productCategory.filter(
          (category) => category.category.name !== 'General',
        );
        const categoryIdsToDelete = filteredCategories.map(
          (category) => category.id,
        );
        await this.productCategoryRepository.delete(categoryIdsToDelete);

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
    if (updateProductDto.name) {
      const categoryCheck = await this.categoryRepository
        .createQueryBuilder('category')
        .leftJoinAndSelect('category.categoryProduct', 'categoryProduct')
        .leftJoinAndSelect('categoryProduct.product', 'product')
        .where('product.id = :id', { id: id })
        .getOne();
      if (!categoryCheck) {
        return {
          data: null,
          message: CONSTANT_RESPONSE.NOT_EXSIST,
          status: false,
        };
      }
      const findsameNameProduct = await this.productRepository
        .createQueryBuilder('product')
        .leftJoinAndSelect('product.categoryProduct', 'categoryProduct')
        .leftJoinAndSelect('categoryProduct.category', 'category')
        .where(`product.name = '${updateProductDto.name}'`)
        .andWhere('product.id != :id', { id: id })
        .andWhere(`category.id = '${categoryCheck.id}'`)
        .andWhere('category.isDeleted = false')
        .andWhere('product.isDeleted = false')
        .getOne();

      if (findsameNameProduct) {
        return {
          data: null,
          message: 'Product with same name already exists in this category',
          status: false,
        };
      }
    }
    delete updateProductDto.file;
    delete updateProductDto.categoryIds;
    delete updateProductDto.isGeneral;
    if (updateProductDto.price1 && updateProductDto.price2) {
      updateProductDto.price =
        updateProductDto.price1 + '-' + updateProductDto.price2;
      delete updateProductDto.price1;
      delete updateProductDto.price2;
    }
    const { affected } = await this.productRepository.update(
      id,
      updateProductDto,
    );
    if (affected === 1) {
      return {
        data: null,
        message: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY,
        status: true,
      };
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
      .andWhere('category.isDeleted = false')
      .andWhere('product.isDeleted = false');
    const queryToGetCount = this.productCategoryRepository
      .createQueryBuilder('productCategory')
      .leftJoinAndSelect('productCategory.category', 'category')
      .leftJoinAndSelect('productCategory.product', 'product')
      .andWhere('category.isDeleted = false')
      .andWhere('product.isDeleted = false');

    if (productName != null) {
      const parameterValue = '%' + productName + '%';
      queryToGetData.andWhere('product.name LIKE :productName');
      queryToGetData.setParameter('productName', parameterValue);

      queryToGetCount.andWhere('product.name LIKE :productName');
      queryToGetCount.setParameter('productName', parameterValue);
    }
    if (categoryId != null) {
      queryToGetData.andWhere(`category.id = '${categoryId}'`);
      queryToGetCount.andWhere(`category.id = '${categoryId}'`);
    }

    if (maxPrice != null && minPrice != null) {
      queryToGetData.andWhere(
        `
    CAST(SUBSTRING_INDEX(product.price, '-', 1) AS DECIMAL) <= :maxPrice 
    AND CAST(SUBSTRING_INDEX(product.price, '-', -1) AS DECIMAL) >= :minPrice
  `,
        { maxPrice, minPrice },
      );

      queryToGetCount.andWhere(
        `
    CAST(SUBSTRING_INDEX(product.price, '-', 1) AS DECIMAL) <= :maxPrice 
    AND CAST(SUBSTRING_INDEX(product.price, '-', -1) AS DECIMAL) >= :minPrice
  `,
        { maxPrice, minPrice },
      );
    }

    const skip = (page - 1) * take;

    let [query, totalCount] = await Promise.all([
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
          'product.createdAt',
          'product.updatedAt',
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
        categoryProduct.product['price1'] =
          categoryProduct.product.price.split('-')[0];
        categoryProduct.product['price2'] =
          categoryProduct.product.price.split('-')[1];
        //delete the price
        delete categoryProduct.product.price;
      });
    });

    query.forEach((category) => {
      if (
        category.name === 'General' &&
        (categoryId === null || categoryId === undefined) &&
        (productName != null || productName != undefined)
      ) {
        query = query.filter((category) => category.name !== 'General');
        totalCount = query.length;
      }
      category.categoryProduct.forEach((categoryProduct) => {
        categoryProduct.product['isFavourite'] = favouriteProductIds.includes(
          categoryProduct.product.id,
        );
      });
    });

    if (categoryId != null || categoryId != undefined) {
      const otherCategories = await this.categoryRepository.find({
        where: { name: Not('General') },
        relations: ['categoryProduct', 'categoryProduct.product'],
      });

      query.forEach((category) => {
        if (category.name === 'General') {
          category.categoryProduct.forEach((categoryProduct) => {
            otherCategories.forEach((otherCategory) => {
              otherCategory.categoryProduct.forEach((otherCategoryProduct) => {
                if (
                  otherCategoryProduct.product.id === categoryProduct.product.id
                ) {
                  categoryProduct.product['mainCategory'] = otherCategory.name;
                }
              });
            });
          });
        }
      });
    }

    query.forEach((category) => {
      if (category.name === 'General') {
        category.categoryProduct.forEach((categoryProduct) => {
          query.forEach((otherCategory) => {
            if (otherCategory.name !== 'General') {
              otherCategory.categoryProduct.forEach((otherCategoryProduct) => {
                if (
                  otherCategoryProduct.product.id === categoryProduct.product.id
                ) {
                  categoryProduct.product['mainCategory'] = otherCategory.name;
                }
              });
            }
          });
        });
      }
    });

    return {
      data: paginateResponse({ query, totalCount, take, page }),
      message: CONSTANT_RESPONSE.RECORD_FOUND,
    };
  }
}
