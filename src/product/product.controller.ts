/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Query,
  Res,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { ApiBearerAuth, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { swaggerDocs } from '../utils/decorator/swagger.decorator';
import { CONSTANT_RESPONSE } from '../utils/constant/return.constant';
import { JwtAuthGuard, RoleGuard } from '../utils/guard';
import { Roles } from 'src/utils/decorator/role.decorator';
import { UserId } from 'src/utils/decorator/userId.decorator';
import { Response } from 'express';

@Controller('product')
@ApiTags('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @ApiConsumes('multipart/form-data')
  @swaggerDocs({
    summary: 'Create a new product',
    type: CreateProductDto,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.CREATE_REJECTION,
    },
  })
  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Multer.File,
    @Body() createProductDto: CreateProductDto,
    @Res() res: Response,
  ) {
    const createProductResult = await this.productService.create(
      { fileBuffer: file?.buffer, originalName: file?.originalname },
      createProductDto,
    );
    file.buffer = null;

    if (!createProductResult.status) {
      return res.status(400).json(createProductResult);
    }

    return res.status(201).json(createProductResult);
  }
  @Get('product-detail/:productId')
  productDetail(@Param('productId') productId: string) {
    return this.productService.productDetail(productId);
  }

  @Get()
  @ApiQuery({ name: 'categoryId', required: false })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'productName', required: false })
  @ApiQuery({ name: 'minPrice', required: false })
  @ApiQuery({ name: 'maxPrice', required: false })
  findOne(
    @UserId() userId: string,
    @Query('categoryId') categoryId?: string,
    @Query('page') page?: string,
    @Query('take') take?: string,
    @Query('productName') productName?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
  ) {
    if (isNaN(+page) || !page || !+page) page = '1';
    if (isNaN(+take) || !take || !+take) take = '10';
    if (!minPrice) minPrice = '0';
    if (!maxPrice) maxPrice = '5000';
    return this.productService.categoryProduct(
      userId,
      categoryId,
      productName,
      minPrice,
      maxPrice,
      +page,
      +take,
    );
  }

  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  @ApiConsumes('multipart/form-data')
  @swaggerDocs({
    summary: 'update product',
    type: null,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.CREATE_REJECTION,
    },
  })
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  async update(
    @UploadedFile() file: Multer.File,
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
    @Res() res: Response,
  ) {
    const updatedProduct = await this.productService.update(
      id,
      updateProductDto,
      {
        fileBuffer: file?.buffer,
        originalName: file?.originalname || undefined,
      },
    );
    if (!updatedProduct.status) {
      return res.status(400).json(updatedProduct);
    }
    return res.status(201).json(updatedProduct);
  }

  @ApiBearerAuth('jwt')
  @UseGuards(JwtAuthGuard, RoleGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
