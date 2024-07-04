/* eslint-disable prettier/prettier */
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CONSTANT_RESPONSE } from '../utils/constant/return.constant';
import { swaggerDocs } from '../utils/decorator/swagger.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard, RoleGuard } from '../utils/guard';
import { Roles } from '../utils/decorator/role.decorator';
import { Response } from 'express';
@Controller('category')
@ApiTags('Categories')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RoleGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @swaggerDocs({
    summary: 'create category',
    type: CreateCategoryDto,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.CREATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.CREATE_REJECTION,
    },
  })
  @Roles('admin')
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @Res() res: Response,
  ) {
    const createCategory = await this.categoryService.create(createCategoryDto);
    return res.status(createCategory.status ? 201 : 400).send(createCategory);
  }

  @Get()
  @swaggerDocs({
    summary: 'get all category',
    type: null,
    goodResponse: { status: 201, description: CONSTANT_RESPONSE.GET_ALL },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.RECORD_NOT_FOUND,
    },
  })
  @Roles('user')
  findAll() {
    return this.categoryService.findAll();
  }
  @Get(':id')
  @swaggerDocs({
    summary: 'get by id',
    type: null,
    goodResponse: { status: 201, description: CONSTANT_RESPONSE.RECORD_FOUND },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.RECORD_NOT_FOUND,
    },
  })
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Patch(':id')
  @swaggerDocs({
    summary: 'update category',
    type: CreateCategoryDto,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.UPDATED_SUCCESSFULLY,
    },
    badresponse: {
      status: 400,
      description: CONSTANT_RESPONSE.UPDATE_REJECTION,
    },
  })
  @Roles('admin')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: Partial<CreateCategoryDto>,
    @Res() res: Response,
  ) {
    const updateCategory = await  this.categoryService.update(id, updateCategoryDto);
    return res.status(updateCategory.status ? 201 : 400).send(updateCategory);
  }

  @Delete(':id')
  @Roles('admin')
  @swaggerDocs({
    summary: 'update category',
    type: null,
    goodResponse: {
      status: 201,
      description: CONSTANT_RESPONSE.DELETED_SUCCESSFULLY,
    },
    badresponse: { status: 400, description: CONSTANT_RESPONSE.DELETE_FAILED },
  })
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }
}
