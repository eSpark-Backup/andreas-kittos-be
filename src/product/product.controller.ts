import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { swaggerDocs } from '../utils/decorator/swagger.decorator';
import { CONSTANT_RESPONSE } from '../utils/constant/return.constant';

@Controller('product')
@ApiTags('product')
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
  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Multer.File,@Body() createProductDto: CreateProductDto) {
    const createProductResult = await this.productService.create({fileBuffer:file.buffer,originalName:file.originalname},createProductDto );
    file.buffer = null;
    return createProductResult;
  }

  @Get()
  findAll() {
    return this.productService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @ApiConsumes('multipart/form-data')
  @swaggerDocs({
    summary: 'update product',
    type: null,
    goodResponse: { status: 201, description: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY },
    badresponse: { status: 400, description: CONSTANT_RESPONSE.CREATE_REJECTION }
  }) 
  @Patch(':id')
  @UseInterceptors(FileInterceptor('file'))
  update(@UploadedFile() file: Multer.File,@Param('id') id: string, @Body() updateProductDto:UpdateProductDto) {
    return this.productService.update(id, updateProductDto,{fileBuffer:file.buffer,originalName:file.originalname});
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productService.remove(+id);
  }
}
