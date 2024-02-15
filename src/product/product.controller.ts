/* eslint-disable prettier/prettier */
import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, UseGuards, Query } from '@nestjs/common';
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

@Controller('product')
@ApiTags('product')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RoleGuard)
export class ProductController {
  constructor(private readonly productService: ProductService
  ) { }

  @ApiConsumes('multipart/form-data')
  @swaggerDocs({
    summary: 'Create a new product',
    type: CreateProductDto,
    goodResponse: { status: 201, description: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY },
    badresponse: { status: 400, description: CONSTANT_RESPONSE.CREATE_REJECTION }
  })

  @Roles('admin')
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Multer.File, @Body() createProductDto: CreateProductDto) {
    const createProductResult = await this.productService.create({ fileBuffer: file?.buffer, originalName: file?.originalname }, createProductDto);
    file.buffer = null;
    return createProductResult;
  }


  @Roles('user')
  @Get('product-detail/:productId')
  productDetail(@Param('productId') productId: string) {
    return this.productService.productDetail(productId);
  }

  @Roles('user')
  @Get()
  @ApiQuery({ name: 'categoryId' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'take', required: false })
  @ApiQuery({ name: 'productName', required: false })
  findOne(@Query('categoryId') categoryId: string, @Query('page') page?: string,
    @Query('take') take?: string, @Query('productName') productName?: string) {
      if (isNaN(+page) || !page || !+page) page = '1';
      if (isNaN(+take) || !take || !+take) take = '10';
    return this.productService.categoryProduct(categoryId, productName, +page, +take);
  }

  @Roles('admin')
  @ApiConsumes('multipart/form-data')
  @swaggerDocs({
    summary: 'update product',
    type: null,
    goodResponse: { status: 201, description: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY },
    badresponse: { status: 400, description: CONSTANT_RESPONSE.CREATE_REJECTION }
  })
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(@UploadedFile() file: Multer.File, @Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productService.update(id, updateProductDto, { fileBuffer: file?.buffer, originalName: file?.originalname || undefined });
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
